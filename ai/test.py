
import os
import json
import copy
import random
import numpy as np
import pandas as pd

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score


# ============================================================
# REVIVAL IVF - BALANCED EMBRYO AI TRAINING
# ============================================================

print("=" * 70)
print("REVIVAL IVF - BALANCED EMBRYO AI TRAINING")
print("=" * 70)


# ============================================================
# REPRODUCIBILITY
# ============================================================

SEED = 42

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

TRAIN_CSV = os.path.join(
    BASE_DIR,
    "dataset",
    "Gardner_train_silver.csv"
)

IMAGE_DIR = os.path.join(
    BASE_DIR,
    "dataset",
    "images"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "revival_ivf_embryo_model.pth"
)

CLASS_MAPPING_PATH = os.path.join(
    MODEL_DIR,
    "class_mapping.json"
)


os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# TRAINING SETTINGS
# ============================================================

EPOCHS = 30

BATCH_SIZE = 16

LEARNING_RATE = 3e-5

WEIGHT_DECAY = 1e-4

VALIDATION_SIZE = 0.20

PATIENCE = 7

NUM_WORKERS = 0

IMAGE_SIZE = 224


# ============================================================
# DEVICE
# ============================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(
    f"Device: {device}"
)

if torch.cuda.is_available():

    print("GPU detected.")
    print(
        f"GPU: {torch.cuda.get_device_name(0)}"
    )

else:

    print(
        "GPU not detected. Training will use CPU."
    )


# ============================================================
# CHECK DATASET
# ============================================================

print("\nChecking dataset...")

if not os.path.exists(TRAIN_CSV):

    raise FileNotFoundError(
        f"\nTraining CSV not found:\n{TRAIN_CSV}"
    )


if not os.path.exists(IMAGE_DIR):

    raise FileNotFoundError(
        f"\nImage folder not found:\n{IMAGE_DIR}"
    )


print("✓ Training CSV found")
print("✓ Image folder found")


# ============================================================
# LOAD CSV
# ============================================================

print("\nLoading training CSV...")

df = pd.read_csv(
    TRAIN_CSV,
    sep=";"
)

df.columns = [
    str(column).strip()
    for column in df.columns
]

print(
    f"Total CSV rows: {len(df)}"
)

print(
    "Columns:",
    list(df.columns)
)


# ============================================================
# REQUIRED COLUMNS
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
            f"Missing required column: {column}"
        )


# ============================================================
# CLEAN LABELS
# ============================================================

label_columns = [
    "EXP_silver",
    "ICM_silver",
    "TE_silver"
]

for column in label_columns:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# ============================================================
# REMOVE INVALID LABEL ROWS
# ============================================================

before_rows = len(df)

df = df.dropna(
    subset=label_columns
).copy()

df["EXP_silver"] = (
    df["EXP_silver"]
    .astype(int)
)

df["ICM_silver"] = (
    df["ICM_silver"]
    .astype(int)
)

df["TE_silver"] = (
    df["TE_silver"]
    .astype(int)
)

df = df.reset_index(
    drop=True
)

print(
    f"Usable rows after label cleaning: {len(df)}"
)

print(
    f"Removed rows: {before_rows - len(df)}"
)


# ============================================================
# CHECK IMAGE FILES
# ============================================================

print("\nChecking images...")

missing_images = []

for image_name in df["Image"]:

    image_path = os.path.join(
        IMAGE_DIR,
        str(image_name)
    )

    if not os.path.isfile(image_path):

        missing_images.append(
            str(image_name)
        )


if missing_images:

    print(
        f"ERROR: {len(missing_images)} images are missing."
    )

    print(
        "\nFirst missing images:"
    )

    for image in missing_images[:20]:

        print(image)

    raise FileNotFoundError(
        "Some training images are missing."
    )

else:

    print(
        f"✓ All {len(df)} training images found."
    )


# ============================================================
# CLASS DISTRIBUTION
# ============================================================

print("\n")
print("=" * 70)
print("CLASS DISTRIBUTION")
print("=" * 70)


for column in label_columns:

    print(f"\n{column}:")

    counts = (
        df[column]
        .value_counts()
        .sort_index()
    )

    for class_id, count in counts.items():

        print(
            f"  Class {class_id}: {count}"
        )


# ============================================================
# TRAIN / VALIDATION SPLIT
# ============================================================

print("\n")
print("=" * 70)
print("CREATING TRAIN / VALIDATION SPLIT")
print("=" * 70)


train_df, validation_df = train_test_split(
    df,
    test_size=VALIDATION_SIZE,
    random_state=SEED,
    shuffle=True
)


train_df = train_df.reset_index(
    drop=True
)

validation_df = validation_df.reset_index(
    drop=True
)


print(
    f"Training samples: {len(train_df)}"
)

print(
    f"Validation samples: {len(validation_df)}"
)


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

train_transform = transforms.Compose(
    [

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
            brightness=0.12,
            contrast=0.12,
            saturation=0.08
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

    ]
)


validation_transform = transforms.Compose(
    [

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

    ]
)


# ============================================================
# DATASET
# ============================================================

class EmbryoDataset(Dataset):

    def __init__(
        self,
        dataframe,
        image_dir,
        transform=None
    ):

        self.dataframe = (
            dataframe
            .reset_index(drop=True)
        )

        self.image_dir = image_dir

        self.transform = transform


    def __len__(self):

        return len(
            self.dataframe
        )


    def __getitem__(
        self,
        index
    ):

        row = (
            self.dataframe
            .iloc[index]
        )

        image_name = str(
            row["Image"]
        )

        image_path = os.path.join(
            self.image_dir,
            image_name
        )

        image = Image.open(
            image_path
        ).convert("RGB")


        if self.transform is not None:

            image = self.transform(
                image
            )


        exp_label = int(
            row["EXP_silver"]
        )

        icm_label = int(
            row["ICM_silver"]
        )

        te_label = int(
            row["TE_silver"]
        )


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
    dataframe=train_df,
    image_dir=IMAGE_DIR,
    transform=train_transform
)


validation_dataset = EmbryoDataset(
    dataframe=validation_df,
    image_dir=IMAGE_DIR,
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
    pin_memory=torch.cuda.is_available()
)


validation_loader = DataLoader(
    validation_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available()
)


print(
    f"Training batches: {len(train_loader)}"
)

print(
    f"Validation batches: {len(validation_loader)}"
)


# ============================================================
# MODERATE CLASS WEIGHTS
# ============================================================

def create_moderate_weights(
    values,
    number_of_classes
):

    counts = np.bincount(
        values,
        minlength=number_of_classes
    ).astype(np.float32)


    counts[counts == 0] = 1.0


    # --------------------------------------------------------
    # IMPORTANT
    #
    # We use square-root inverse frequency instead of
    # ordinary inverse frequency.
    #
    # This prevents extremely rare classes from receiving
    # huge weights such as 31.9.
    # --------------------------------------------------------

    weights = 1.0 / np.sqrt(
        counts
    )


    weights = (
        weights /
        weights.mean()
    )


    # Safety limit
    weights = np.clip(
        weights,
        0.50,
        5.00
    )


    return torch.tensor(
        weights,
        dtype=torch.float32
    )


# ============================================================
# CREATE WEIGHTS FROM TRAINING DATA ONLY
# ============================================================

exp_weights = create_moderate_weights(
    train_df["EXP_silver"].values,
    5
)


icm_weights = create_moderate_weights(
    train_df["ICM_silver"].values,
    4
)


te_weights = create_moderate_weights(
    train_df["TE_silver"].values,
    4
)


print("\n")
print("=" * 70)
print("MODERATE CLASS WEIGHTS")
print("=" * 70)

print(
    "\nEXP weights:"
)

print(
    exp_weights.numpy()
)


print(
    "\nICM weights:"
)

print(
    icm_weights.numpy()
)


print(
    "\nTE weights:"
)

print(
    te_weights.numpy()
)


# ============================================================
# MODEL
# ============================================================

print("\n")
print("=" * 70)
print("CREATING MODEL")
print("=" * 70)


class EmbryoModel(nn.Module):

    def __init__(
        self,
        num_exp_classes=5,
        num_icm_classes=4,
        num_te_classes=4
    ):

        super().__init__()


        # ----------------------------------------------------
        # PRETRAINED RESNET18
        # ----------------------------------------------------

        try:

            self.backbone = models.resnet18(
                weights=models.ResNet18_Weights.DEFAULT
            )

            print(
                "Using pretrained ResNet18 weights."
            )

        except Exception:

            print(
                "Could not load pretrained weights."
            )

            print(
                "Using ResNet18 without pretrained weights."
            )

            self.backbone = models.resnet18(
                weights=None
            )


        num_features = (
            self.backbone.fc.in_features
        )


        # ----------------------------------------------------
        # REMOVE ORIGINAL CLASSIFIER
        # ----------------------------------------------------

        self.backbone.fc = nn.Identity()


        # ----------------------------------------------------
        # SHARED FEATURE LAYER
        #
        # IMPORTANT:
        # This architecture matches the improved test.py
        # architecture that successfully loaded previously.
        # ----------------------------------------------------

        self.shared = nn.Sequential(

            nn.Linear(
                num_features,
                256
            ),

            nn.ReLU(),

            nn.Dropout(
                p=0.30
            )

        )


        # ----------------------------------------------------
        # THREE OUTPUT HEADS
        # ----------------------------------------------------

        self.exp_head = nn.Linear(
            256,
            num_exp_classes
        )


        self.icm_head = nn.Linear(
            256,
            num_icm_classes
        )


        self.te_head = nn.Linear(
            256,
            num_te_classes
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


# ============================================================
# CREATE MODEL
# ============================================================

model = EmbryoModel()

model = model.to(
    device
)


# ============================================================
# LOSS FUNCTIONS
# ============================================================

exp_weights = exp_weights.to(
    device
)

icm_weights = icm_weights.to(
    device
)

te_weights = te_weights.to(
    device
)


exp_loss_function = nn.CrossEntropyLoss(
    weight=exp_weights,
    label_smoothing=0.05
)


icm_loss_function = nn.CrossEntropyLoss(
    weight=icm_weights,
    label_smoothing=0.05
)


te_loss_function = nn.CrossEntropyLoss(
    weight=te_weights,
    label_smoothing=0.05
)


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# ============================================================
# LEARNING RATE SCHEDULER
# ============================================================

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2,
    min_lr=1e-7
)


# ============================================================
# HELPER FUNCTION
# ============================================================

def calculate_metrics(
    true_values,
    predicted_values,
    number_of_classes
):

    accuracy = accuracy_score(
        true_values,
        predicted_values
    )


    macro_f1 = f1_score(
        true_values,
        predicted_values,
        average="macro",
        labels=list(
            range(number_of_classes)
        ),
        zero_division=0
    )


    return (
        accuracy,
        macro_f1
    )


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch():

    model.train()


    total_loss = 0.0


    exp_true = []
    exp_pred = []

    icm_true = []
    icm_pred = []

    te_true = []
    te_pred = []


    for (
        images,
        exp_labels,
        icm_labels,
        te_labels
    ) in train_loader:


        images = images.to(
            device,
            non_blocking=True
        )

        exp_labels = exp_labels.to(
            device,
            non_blocking=True
        )

        icm_labels = icm_labels.to(
            device,
            non_blocking=True
        )

        te_labels = te_labels.to(
            device,
            non_blocking=True
        )


        optimizer.zero_grad(
            set_to_none=True
        )


        (
            exp_output,
            icm_output,
            te_output
        ) = model(
            images
        )


        exp_loss = exp_loss_function(
            exp_output,
            exp_labels
        )


        icm_loss = icm_loss_function(
            icm_output,
            icm_labels
        )


        te_loss = te_loss_function(
            te_output,
            te_labels
        )


        # Equal contribution from all three tasks
        loss = (
            exp_loss +
            icm_loss +
            te_loss
        ) / 3.0


        loss.backward()


        # Prevent unstable gradients
        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=2.0
        )


        optimizer.step()


        total_loss += (
            loss.item()
            * images.size(0)
        )


        exp_predictions = (
            torch.argmax(
                exp_output,
                dim=1
            )
        )


        icm_predictions = (
            torch.argmax(
                icm_output,
                dim=1
            )
        )


        te_predictions = (
            torch.argmax(
                te_output,
                dim=1
            )
        )


        exp_true.extend(
            exp_labels
            .detach()
            .cpu()
            .numpy()
        )

        exp_pred.extend(
            exp_predictions
            .detach()
            .cpu()
            .numpy()
        )


        icm_true.extend(
            icm_labels
            .detach()
            .cpu()
            .numpy()
        )

        icm_pred.extend(
            icm_predictions
            .detach()
            .cpu()
            .numpy()
        )


        te_true.extend(
            te_labels
            .detach()
            .cpu()
            .numpy()
        )

        te_pred.extend(
            te_predictions
            .detach()
            .cpu()
            .numpy()
        )


    average_loss = (
        total_loss /
        len(train_dataset)
    )


    exp_accuracy, exp_f1 = calculate_metrics(
        exp_true,
        exp_pred,
        5
    )


    icm_accuracy, icm_f1 = calculate_metrics(
        icm_true,
        icm_pred,
        4
    )


    te_accuracy, te_f1 = calculate_metrics(
        te_true,
        te_pred,
        4
    )


    return (
        average_loss,
        exp_accuracy,
        exp_f1,
        icm_accuracy,
        icm_f1,
        te_accuracy,
        te_f1
    )


# ============================================================
# VALIDATION FUNCTION
# ============================================================

def validate():

    model.eval()


    total_loss = 0.0


    exp_true = []
    exp_pred = []

    icm_true = []
    icm_pred = []

    te_true = []
    te_pred = []


    with torch.no_grad():

        for (
            images,
            exp_labels,
            icm_labels,
            te_labels
        ) in validation_loader:


            images = images.to(
                device,
                non_blocking=True
            )

            exp_labels = exp_labels.to(
                device,
                non_blocking=True
            )

            icm_labels = icm_labels.to(
                device,
                non_blocking=True
            )

            te_labels = te_labels.to(
                device,
                non_blocking=True
            )


            (
                exp_output,
                icm_output,
                te_output
            ) = model(
                images
            )


            exp_loss = exp_loss_function(
                exp_output,
                exp_labels
            )


            icm_loss = icm_loss_function(
                icm_output,
                icm_labels
            )


            te_loss = te_loss_function(
                te_output,
                te_labels
            )


            loss = (
                exp_loss +
                icm_loss +
                te_loss
            ) / 3.0


            total_loss += (
                loss.item()
                * images.size(0)
            )


            exp_predictions = (
                torch.argmax(
                    exp_output,
                    dim=1
                )
            )


            icm_predictions = (
                torch.argmax(
                    icm_output,
                    dim=1
                )
            )


            te_predictions = (
                torch.argmax(
                    te_output,
                    dim=1
                )
            )


            exp_true.extend(
                exp_labels
                .cpu()
                .numpy()
            )

            exp_pred.extend(
                exp_predictions
                .cpu()
                .numpy()
            )


            icm_true.extend(
                icm_labels
                .cpu()
                .numpy()
            )

            icm_pred.extend(
                icm_predictions
                .cpu()
                .numpy()
            )


            te_true.extend(
                te_labels
                .cpu()
                .numpy()
            )

            te_pred.extend(
                te_predictions
                .cpu()
                .numpy()
            )


    average_loss = (
        total_loss /
        len(validation_dataset)
    )


    exp_accuracy, exp_f1 = calculate_metrics(
        exp_true,
        exp_pred,
        5
    )


    icm_accuracy, icm_f1 = calculate_metrics(
        icm_true,
        icm_pred,
        4
    )


    te_accuracy, te_f1 = calculate_metrics(
        te_true,
        te_pred,
        4
    )


    overall_macro_f1 = (
        exp_f1 +
        icm_f1 +
        te_f1
    ) / 3.0


    return (
        average_loss,
        exp_accuracy,
        exp_f1,
        icm_accuracy,
        icm_f1,
        te_accuracy,
        te_f1,
        overall_macro_f1
    )


# ============================================================
# TRAINING START
# ============================================================

print("\n")
print("=" * 70)
print("STARTING BALANCED TRAINING")
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
    "\nCheckpoint selection:"
)

print(
    "Validation Macro-F1"
)

print(
    "\nThis version uses moderate class weighting"
)

print(
    "to prevent rare ICM classes from dominating."
)

print("=" * 70)


# ============================================================
# BEST MODEL TRACKING
# ============================================================

best_macro_f1 = -1.0

best_validation_loss = float(
    "inf"
)

best_epoch = 0

best_model_state = None

epochs_without_improvement = 0


# ============================================================
# TRAINING LOOP
# ============================================================

for epoch in range(
    1,
    EPOCHS + 1
):


    print("\n")
    print(
        f"Epoch {epoch}/{EPOCHS}"
    )

    print(
        "-" * 70
    )


    current_lr = optimizer.param_groups[0][
        "lr"
    ]


    print(
        f"Learning Rate: {current_lr:.8f}"
    )


    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    (
        train_loss,
        train_exp_accuracy,
        train_exp_f1,
        train_icm_accuracy,
        train_icm_f1,
        train_te_accuracy,
        train_te_f1
    ) = train_one_epoch()


    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    (
        validation_loss,
        validation_exp_accuracy,
        validation_exp_f1,
        validation_icm_accuracy,
        validation_icm_f1,
        validation_te_accuracy,
        validation_te_f1,
        overall_macro_f1
    ) = validate()


    # --------------------------------------------------------
    # PRINT RESULTS
    # --------------------------------------------------------

    print(
        f"\nTrain Loss: {train_loss:.4f}"
    )

    print(
        f"Validation Loss: {validation_loss:.4f}"
    )


    print("\nEXP:")

    print(
        f"  Train Accuracy: "
        f"{train_exp_accuracy * 100:.2f}%"
    )

    print(
        f"  Train Macro-F1: "
        f"{train_exp_f1 * 100:.2f}%"
    )

    print(
        f"  Validation Accuracy: "
        f"{validation_exp_accuracy * 100:.2f}%"
    )

    print(
        f"  Validation Macro-F1: "
        f"{validation_exp_f1 * 100:.2f}%"
    )


    print("\nICM:")

    print(
        f"  Train Accuracy: "
        f"{train_icm_accuracy * 100:.2f}%"
    )

    print(
        f"  Train Macro-F1: "
        f"{train_icm_f1 * 100:.2f}%"
    )

    print(
        f"  Validation Accuracy: "
        f"{validation_icm_accuracy * 100:.2f}%"
    )

    print(
        f"  Validation Macro-F1: "
        f"{validation_icm_f1 * 100:.2f}%"
    )


    print("\nTE:")

    print(
        f"  Train Accuracy: "
        f"{train_te_accuracy * 100:.2f}%"
    )

    print(
        f"  Train Macro-F1: "
        f"{train_te_f1 * 100:.2f}%"
    )

    print(
        f"  Validation Accuracy: "
        f"{validation_te_accuracy * 100:.2f}%"
    )

    print(
        f"  Validation Macro-F1: "
        f"{validation_te_f1 * 100:.2f}%"
    )


    print(
        "\nOverall Validation Macro-F1: "
        f"{overall_macro_f1 * 100:.2f}%"
    )


    # --------------------------------------------------------
    # SAVE BEST MODEL
    # --------------------------------------------------------

    if overall_macro_f1 > best_macro_f1:

        best_macro_f1 = (
            overall_macro_f1
        )

        best_validation_loss = (
            validation_loss
        )

        best_epoch = epoch

        best_model_state = copy.deepcopy(
            model.state_dict()
        )

        epochs_without_improvement = 0


        print(
            "\n✓ BEST MODEL SAVED"
        )

        print(
            f"  Validation Macro-F1: "
            f"{best_macro_f1 * 100:.2f}%"
        )


        checkpoint = {

            "model_state_dict":
                best_model_state,

            "epoch":
                best_epoch,

            "best_macro_f1":
                best_macro_f1,

            "best_validation_loss":
                best_validation_loss,

            "architecture":
                "resnet18_shared_256",

            "num_exp_classes":
                5,

            "num_icm_classes":
                4,

            "num_te_classes":
                4

        }


        torch.save(
            checkpoint,
            MODEL_PATH
        )


    else:

        epochs_without_improvement += 1

        print(
            f"\nNo improvement "
            f"({epochs_without_improvement}/{PATIENCE})"
        )


    # --------------------------------------------------------
    # LEARNING RATE SCHEDULER
    # --------------------------------------------------------

    scheduler.step(
        overall_macro_f1
    )


    # --------------------------------------------------------
    # EARLY STOPPING
    # --------------------------------------------------------

    if (
        epochs_without_improvement
        >= PATIENCE
    ):

        print(
            "\nEarly stopping triggered."
        )

        break


# ============================================================
# RESTORE BEST MODEL
# ============================================================

if best_model_state is not None:

    model.load_state_dict(
        best_model_state
    )


# ============================================================
# SAVE FINAL BEST CHECKPOINT
# ============================================================

final_checkpoint = {

    "model_state_dict":
        model.state_dict(),

    "epoch":
        best_epoch,

    "best_macro_f1":
        best_macro_f1,

    "best_validation_loss":
        best_validation_loss,

    "architecture":
        "resnet18_shared_256",

    "num_exp_classes":
        5,

    "num_icm_classes":
        4,

    "num_te_classes":
        4

}


torch.save(
    final_checkpoint,
    MODEL_PATH
)


# ============================================================
# CLASS MAPPING
# ============================================================

class_mapping = {

    "EXP": {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4
    },

    "ICM": {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3
    },

    "TE": {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3
    }

}


with open(
    CLASS_MAPPING_PATH,
    "w"
) as file:

    json.dump(
        class_mapping,
        file,
        indent=4
    )


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n")
print("=" * 70)
print("BALANCED TRAINING COMPLETE")
print("=" * 70)


print(
    f"\nBest epoch: {best_epoch}"
)


print(
    f"Best validation Macro-F1: "
    f"{best_macro_f1 * 100:.2f}%"
)


print(
    f"Best validation loss: "
    f"{best_validation_loss:.4f}"
)


print(
    "\nModel saved at:"
)


print(
    MODEL_PATH
)


print(
    "\nClass mapping saved at:"
)


print(
    CLASS_MAPPING_PATH
)


print("\n")
print(
    "IMPORTANT:"
)

print(
    "Do NOT use the model in the application yet."
)

print(
    "First run the separate test.py and compare"
)

print(
    "the test accuracy/F1 with the previous model."
)


print("\n")
print(
    "Next command:"
)

print(
    "python test.py"
)


print("=" * 70)
print(
    "REVIVAL IVF balanced embryo AI training finished."
)
print("=" * 70)

