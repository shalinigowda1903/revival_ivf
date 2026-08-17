import os
import json
import random
from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms


# ============================================================
# REVIVAL IVF - EMBRYO AI TRAINING
# ============================================================

print("\n" + "=" * 70)
print("REVIVAL IVF - EMBRYO AI TRAINING")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = BASE_DIR / "dataset"
IMAGE_DIR = DATASET_DIR / "images"

TRAIN_CSV = DATASET_DIR / "Gardner_train_silver.csv"

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FILE = MODEL_DIR / "revival_ivf_embryo_model.pth"
CLASS_FILE = MODEL_DIR / "class_mapping.json"


# ============================================================
# SETTINGS
# ============================================================

IMAGE_SIZE = 224

BATCH_SIZE = 16

EPOCHS = 10

LEARNING_RATE = 0.0001

VALIDATION_SPLIT = 0.20

RANDOM_SEED = 42

NUM_WORKERS = 0


# ============================================================
# RANDOM SEED
# ============================================================

random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)


# ============================================================
# DEVICE
# ============================================================

if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    print("Device: GPU")
    print("GPU:", torch.cuda.get_device_name(0))
else:
    DEVICE = torch.device("cpu")
    print("Device: CPU")
    print("GPU not detected. Training will use CPU.")


# ============================================================
# CHECK FILES
# ============================================================

print("\nChecking dataset...")

if not TRAIN_CSV.exists():
    raise FileNotFoundError(
        f"\nTraining CSV not found:\n{TRAIN_CSV}"
    )

if not IMAGE_DIR.exists():
    raise FileNotFoundError(
        f"\nImage folder not found:\n{IMAGE_DIR}"
    )


# ============================================================
# LOAD CSV
# ============================================================

print("\nLoading training CSV...")

df = pd.read_csv(
    TRAIN_CSV,
    sep=";"
)

print("CSV loaded successfully.")

print("\nColumns:")
print(list(df.columns))

print("\nNumber of rows:", len(df))


# ============================================================
# CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "Image",
    "EXP_silver",
    "ICM_silver",
    "TE_silver"
]

for column in required_columns:

    if column not in df.columns:

        raise ValueError(
            f"\nRequired column missing from CSV: {column}"
        )


# ============================================================
# CLEAN DATA
# ============================================================

df = df.dropna(
    subset=[
        "Image",
        "EXP_silver",
        "ICM_silver",
        "TE_silver"
    ]
).copy()


# ============================================================
# CONVERT LABELS TO INTEGER
# ============================================================

df["EXP_silver"] = pd.to_numeric(
    df["EXP_silver"],
    errors="coerce"
)

df["ICM_silver"] = pd.to_numeric(
    df["ICM_silver"],
    errors="coerce"
)

df["TE_silver"] = pd.to_numeric(
    df["TE_silver"],
    errors="coerce"
)


df = df.dropna(
    subset=[
        "EXP_silver",
        "ICM_silver",
        "TE_silver"
    ]
).copy()


df["EXP_silver"] = df["EXP_silver"].astype(int)
df["ICM_silver"] = df["ICM_silver"].astype(int)
df["TE_silver"] = df["TE_silver"].astype(int)


# ============================================================
# CHECK IMAGE FILES
# ============================================================

print("\nChecking image files...")

missing_images = []

for image_name in df["Image"]:

    image_path = IMAGE_DIR / str(image_name)

    if not image_path.exists():

        missing_images.append(
            str(image_name)
        )


if missing_images:

    print(
        f"\nERROR: {len(missing_images)} images are missing."
    )

    print("\nFirst missing images:")

    for image_name in missing_images[:20]:

        print(image_name)

    raise FileNotFoundError(
        "\nSome CSV images are missing."
    )


print("All CSV images found.")


# ============================================================
# DATASET SUMMARY
# ============================================================

print("\n" + "-" * 70)
print("DATASET SUMMARY")
print("-" * 70)

print("Total usable images:", len(df))

print(
    "EXP classes:",
    sorted(df["EXP_silver"].unique().tolist())
)

print(
    "ICM classes:",
    sorted(df["ICM_silver"].unique().tolist())
)

print(
    "TE classes:",
    sorted(df["TE_silver"].unique().tolist())
)


# ============================================================
# CLASS MAPPINGS
# ============================================================

EXP_CLASSES = sorted(
    df["EXP_silver"].unique().tolist()
)

ICM_CLASSES = sorted(
    df["ICM_silver"].unique().tolist()
)

TE_CLASSES = sorted(
    df["TE_silver"].unique().tolist()
)


EXP_TO_INDEX = {
    value: index
    for index, value in enumerate(EXP_CLASSES)
}

ICM_TO_INDEX = {
    value: index
    for index, value in enumerate(ICM_CLASSES)
}

TE_TO_INDEX = {
    value: index
    for index, value in enumerate(TE_CLASSES)
}


# ============================================================
# SAVE CLASS INFORMATION
# ============================================================

class_mapping = {

    "EXP": EXP_CLASSES,

    "ICM": ICM_CLASSES,

    "TE": TE_CLASSES,

    "description": {
        "EXP": "Embryo expansion score",
        "ICM": "Inner cell mass score",
        "TE": "Trophectoderm score"
    }
}


with open(
    CLASS_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        class_mapping,
        file,
        indent=4
    )


# ============================================================
# TRAIN / VALIDATION SPLIT
# ============================================================

print("\nCreating train/validation split...")

indices = np.arange(len(df))

np.random.shuffle(indices)

validation_size = int(
    len(indices) * VALIDATION_SPLIT
)

validation_indices = indices[
    :validation_size
]

training_indices = indices[
    validation_size:
]


train_df = df.iloc[
    training_indices
].reset_index(drop=True)


val_df = df.iloc[
    validation_indices
].reset_index(drop=True)


print(
    "Training images:",
    len(train_df)
)

print(
    "Validation images:",
    len(val_df)
)


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

train_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        degrees=10
    ),

    transforms.ColorJitter(
        brightness=0.10,
        contrast=0.10
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )

])


validation_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )

])


# ============================================================
# DATASET CLASS
# ============================================================

class EmbryoDataset(Dataset):

    def __init__(
        self,
        dataframe,
        transform=None
    ):

        self.dataframe = dataframe.reset_index(
            drop=True
        )

        self.transform = transform


    def __len__(self):

        return len(
            self.dataframe
        )


    def __getitem__(
        self,
        index
    ):

        row = self.dataframe.iloc[index]

        image_name = str(
            row["Image"]
        )

        image_path = IMAGE_DIR / image_name

        try:

            image = Image.open(
                image_path
            ).convert("RGB")

        except Exception as error:

            raise RuntimeError(
                f"\nCould not open image:\n"
                f"{image_path}\n\n"
                f"Error: {error}"
            )


        if self.transform:

            image = self.transform(
                image
            )


        exp_label = EXP_TO_INDEX[
            int(row["EXP_silver"])
        ]

        icm_label = ICM_TO_INDEX[
            int(row["ICM_silver"])
        ]

        te_label = TE_TO_INDEX[
            int(row["TE_silver"])
        ]


        return (
            image,
            torch.tensor(
                exp_label,
                dtype=torch.long
            ),
            torch.tensor(
                icm_label,
                dtype=torch.long
            ),
            torch.tensor(
                te_label,
                dtype=torch.long
            )
        )


# ============================================================
# CREATE DATASETS
# ============================================================

print("\nPreparing image datasets...")

train_dataset = EmbryoDataset(
    train_df,
    transform=train_transform
)

validation_dataset = EmbryoDataset(
    val_df,
    transform=validation_transform
)


# ============================================================
# DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=NUM_WORKERS,
    pin_memory=False
)

validation_loader = DataLoader(
    validation_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=False
)


print(
    "Training batches:",
    len(train_loader)
)

print(
    "Validation batches:",
    len(validation_loader)
)


# ============================================================
# MODEL
# ============================================================

print("\nCreating CNN model...")

try:

    weights = models.ResNet18_Weights.DEFAULT

    backbone = models.resnet18(
        weights=weights
    )

    print(
        "Using pretrained ResNet18."
    )

except Exception:

    print(
        "Could not load pretrained weights."
    )

    print(
        "Using ResNet18 without pretrained weights."
    )

    backbone = models.resnet18(
        weights=None
    )


# ============================================================
# FREEZE EARLY LAYERS
# ============================================================

for parameter in backbone.parameters():

    parameter.requires_grad = False


# Unfreeze final ResNet layer

for parameter in backbone.layer4.parameters():

    parameter.requires_grad = True


# ============================================================
# FEATURE SIZE
# ============================================================

feature_size = backbone.fc.in_features


backbone.fc = nn.Identity()


# ============================================================
# MULTI-OUTPUT EMBRYO MODEL
# ============================================================

class EmbryoModel(nn.Module):

    def __init__(
        self,
        backbone,
        feature_size,
        exp_classes,
        icm_classes,
        te_classes
    ):

        super().__init__()

        self.backbone = backbone


        self.shared = nn.Sequential(

            nn.Linear(
                feature_size,
                256
            ),

            nn.ReLU(),

            nn.Dropout(
                0.3
            )

        )


        self.exp_head = nn.Linear(
            256,
            exp_classes
        )


        self.icm_head = nn.Linear(
            256,
            icm_classes
        )


        self.te_head = nn.Linear(
            256,
            te_classes
        )


    def forward(
        self,
        x
    ):

        features = self.backbone(
            x
        )

        shared_features = self.shared(
            features
        )


        exp_output = self.exp_head(
            shared_features
        )


        icm_output = self.icm_head(
            shared_features
        )


        te_output = self.te_head(
            shared_features
        )


        return (
            exp_output,
            icm_output,
            te_output
        )


model = EmbryoModel(

    backbone=backbone,

    feature_size=feature_size,

    exp_classes=len(
        EXP_CLASSES
    ),

    icm_classes=len(
        ICM_CLASSES
    ),

    te_classes=len(
        TE_CLASSES
    )

).to(DEVICE)


# ============================================================
# LOSS FUNCTIONS
# ============================================================

criterion_exp = nn.CrossEntropyLoss()

criterion_icm = nn.CrossEntropyLoss()

criterion_te = nn.CrossEntropyLoss()


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(

    filter(
        lambda parameter:
        parameter.requires_grad,
        model.parameters()
    ),

    lr=LEARNING_RATE,

    weight_decay=0.0001

)


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch():

    model.train()

    total_loss = 0.0

    correct_exp = 0

    correct_icm = 0

    correct_te = 0

    total_samples = 0


    for batch_index, batch in enumerate(
        train_loader
    ):

        (
            images,
            exp_labels,
            icm_labels,
            te_labels
        ) = batch


        images = images.to(
            DEVICE
        )

        exp_labels = exp_labels.to(
            DEVICE
        )

        icm_labels = icm_labels.to(
            DEVICE
        )

        te_labels = te_labels.to(
            DEVICE
        )


        optimizer.zero_grad()


        (
            exp_output,
            icm_output,
            te_output
        ) = model(images)


        loss_exp = criterion_exp(
            exp_output,
            exp_labels
        )

        loss_icm = criterion_icm(
            icm_output,
            icm_labels
        )

        loss_te = criterion_te(
            te_output,
            te_labels
        )


        loss = (
            loss_exp
            + loss_icm
            + loss_te
        )


        loss.backward()


        optimizer.step()


        total_loss += (
            loss.item()
            * images.size(0)
        )


        exp_predictions = torch.argmax(
            exp_output,
            dim=1
        )

        icm_predictions = torch.argmax(
            icm_output,
            dim=1
        )

        te_predictions = torch.argmax(
            te_output,
            dim=1
        )


        correct_exp += (
            exp_predictions
            == exp_labels
        ).sum().item()


        correct_icm += (
            icm_predictions
            == icm_labels
        ).sum().item()


        correct_te += (
            te_predictions
            == te_labels
        ).sum().item()


        total_samples += images.size(0)


    average_loss = (
        total_loss
        / total_samples
    )


    exp_accuracy = (
        correct_exp
        / total_samples
        * 100
    )

    icm_accuracy = (
        correct_icm
        / total_samples
        * 100
    )

    te_accuracy = (
        correct_te
        / total_samples
        * 100
    )


    return (
        average_loss,
        exp_accuracy,
        icm_accuracy,
        te_accuracy
    )


# ============================================================
# VALIDATION FUNCTION
# ============================================================

def validate():

    model.eval()

    total_loss = 0.0

    correct_exp = 0

    correct_icm = 0

    correct_te = 0

    total_samples = 0


    with torch.no_grad():

        for batch in validation_loader:

            (
                images,
                exp_labels,
                icm_labels,
                te_labels
            ) = batch


            images = images.to(
                DEVICE
            )

            exp_labels = exp_labels.to(
                DEVICE
            )

            icm_labels = icm_labels.to(
                DEVICE
            )

            te_labels = te_labels.to(
                DEVICE
            )


            (
                exp_output,
                icm_output,
                te_output
            ) = model(images)


            loss_exp = criterion_exp(
                exp_output,
                exp_labels
            )

            loss_icm = criterion_icm(
                icm_output,
                icm_labels
            )

            loss_te = criterion_te(
                te_output,
                te_labels
            )


            loss = (
                loss_exp
                + loss_icm
                + loss_te
            )


            total_loss += (
                loss.item()
                * images.size(0)
            )


            exp_predictions = torch.argmax(
                exp_output,
                dim=1
            )

            icm_predictions = torch.argmax(
                icm_output,
                dim=1
            )

            te_predictions = torch.argmax(
                te_output,
                dim=1
            )


            correct_exp += (
                exp_predictions
                == exp_labels
            ).sum().item()


            correct_icm += (
                icm_predictions
                == icm_labels
            ).sum().item()


            correct_te += (
                te_predictions
                == te_labels
            ).sum().item()


            total_samples += images.size(0)


    average_loss = (
        total_loss
        / total_samples
    )


    exp_accuracy = (
        correct_exp
        / total_samples
        * 100
    )

    icm_accuracy = (
        correct_icm
        / total_samples
        * 100
    )

    te_accuracy = (
        correct_te
        / total_samples
        * 100
    )


    return (
        average_loss,
        exp_accuracy,
        icm_accuracy,
        te_accuracy
    )


# ============================================================
# TRAIN MODEL
# ============================================================

print("\n" + "=" * 70)
print("STARTING TRAINING")
print("=" * 70)

print(
    f"Epochs: {EPOCHS}"
)

print(
    f"Batch size: {BATCH_SIZE}"
)

print(
    f"Learning rate: {LEARNING_RATE}"
)

print(
    f"Training samples: {len(train_dataset)}"
)

print(
    f"Validation samples: {len(validation_dataset)}"
)

print(
    "\nThis may take some time on CPU."
)

print("=" * 70)


best_validation_loss = float(
    "inf"
)


for epoch in range(
    EPOCHS
):

    print(
        f"\nEpoch {epoch + 1}/{EPOCHS}"
    )

    print(
        "-" * 50
    )


    (
        train_loss,
        train_exp_acc,
        train_icm_acc,
        train_te_acc
    ) = train_one_epoch()


    (
        val_loss,
        val_exp_acc,
        val_icm_acc,
        val_te_acc
    ) = validate()


    print(
        f"Train Loss: {train_loss:.4f}"
    )

    print(
        f"Validation Loss: {val_loss:.4f}"
    )

    print(
        f"EXP Train Accuracy: "
        f"{train_exp_acc:.2f}%"
    )

    print(
        f"EXP Validation Accuracy: "
        f"{val_exp_acc:.2f}%"
    )

    print(
        f"ICM Train Accuracy: "
        f"{train_icm_acc:.2f}%"
    )

    print(
        f"ICM Validation Accuracy: "
        f"{val_icm_acc:.2f}%"
    )

    print(
        f"TE Train Accuracy: "
        f"{train_te_acc:.2f}%"
    )

    print(
        f"TE Validation Accuracy: "
        f"{val_te_acc:.2f}%"
    )


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    if val_loss < best_validation_loss:

        best_validation_loss = val_loss


        torch.save(

            {
                "model_state_dict":
                    model.state_dict(),

                "image_size":
                    IMAGE_SIZE,

                "exp_classes":
                    EXP_CLASSES,

                "icm_classes":
                    ICM_CLASSES,

                "te_classes":
                    TE_CLASSES,

                "model_name":
                    "ResNet18",

                "architecture":
                    "multi_output_embryo_classifier"

            },

            MODEL_FILE

        )


        print(
            "\n✓ Best model saved."
        )


# ============================================================
# TRAINING COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print(
    "\nModel saved at:"
)

print(
    MODEL_FILE
)

print(
    "\nClass mapping saved at:"
)

print(
    CLASS_FILE
)

print(
    "\nBest validation loss:"
)

print(
    f"{best_validation_loss:.4f}"
)

print("\n" + "=" * 70)

print(
    "REVIVAL IVF embryo AI model is ready for prediction."
)

print("=" * 70 + "\n")