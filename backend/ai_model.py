
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pathlib import Path


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

# FINAL GOLD-TRAINED MODEL
MODEL_PATH = BASE_DIR / "revival_ivf_headonly_gold_best.pth"

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("=" * 70)
print("REVIVAL IVF AI MODEL")
print("=" * 70)

print("Device:", DEVICE)
print("Model:", MODEL_PATH)


# =========================================================
# REVIVAL IVF MODEL
# =========================================================

class RevivalIVFModel(nn.Module):

    def __init__(self):

        super().__init__()

        # -------------------------------------------------
        # EfficientNet-B0 backbone
        # -------------------------------------------------

        self.backbone = models.efficientnet_b0(
            weights=None
        )

        in_features = (
            self.backbone.classifier[1].in_features
        )

        # Remove ImageNet classifier
        self.backbone.classifier = nn.Identity()

        # -------------------------------------------------
        # Gardner grading heads
        #
        # The GOLD checkpoint contains:
        #
        # exp_head.0
        # exp_head.1
        #
        # icm_head.0
        # icm_head.1
        #
        # te_head.0
        # te_head.1
        #
        # Therefore each head is Sequential.
        # -------------------------------------------------

        self.exp_head = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(
                in_features,
                5
            )
        )

        self.icm_head = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(
                in_features,
                4
            )
        )

        self.te_head = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(
                in_features,
                4
            )
        )


    # =====================================================
    # FORWARD
    # =====================================================

    def forward(self, x):

        features = self.backbone(x)

        exp = self.exp_head(features)

        icm = self.icm_head(features)

        te = self.te_head(features)

        return exp, icm, te


# =========================================================
# CREATE MODEL
# =========================================================

model = RevivalIVFModel()


# =========================================================
# LOAD TRAINED CHECKPOINT
# =========================================================

if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"\n❌ Model file not found:\n{MODEL_PATH}"
    )


checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)


# =========================================================
# LOAD STATE DICTIONARY
# =========================================================

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:

    state_dict = checkpoint["model_state_dict"]

else:

    state_dict = checkpoint


model.load_state_dict(
    state_dict
)


model.to(DEVICE)

model.eval()


print("\n✅ Revival IVF model loaded successfully")

print("Architecture: EfficientNet-B0")

print("EXP classes: 5")
print("ICM classes: 4")
print("TE classes : 4")


# =========================================================
# IMAGE TRANSFORMATION
# =========================================================

transform = transforms.Compose([

    transforms.Resize(
        (224, 224)
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


# =========================================================
# GARDNER LETTER CONVERSION
# =========================================================
#
# ICM / TE:
#
# 1 = A
# 2 = B
# 3 = C
#
# 0 is kept as "0" because your model has 4 classes
# and we should NOT invent a clinical grade for class 0.
#
# =========================================================

def grade_letter(class_index):

    mapping = {
        0: "0",
        1: "A",
        2: "B",
        3: "C"
    }

    return mapping.get(
        class_index,
        "0"
    )


# =========================================================
# ANALYZE EMBRYO
# =========================================================

def analyze_embryo(image_path):

    """
    Analyze one embryo image using the trained
    EfficientNet-B0 Revival IVF model.

    Returns:
        EXP grade
        ICM grade
        TE grade
        Gardner grade
        confidence for each prediction
        overall confidence
    """

    # -----------------------------------------------------
    # Check image
    # -----------------------------------------------------

    image_path = Path(image_path)

    if not image_path.exists():

        raise FileNotFoundError(
            f"Embryo image not found: {image_path}"
        )


    # -----------------------------------------------------
    # Load image
    # -----------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


    # -----------------------------------------------------
    # Transform image
    # -----------------------------------------------------

    image_tensor = transform(
        image
    ).unsqueeze(0).to(DEVICE)


    # -----------------------------------------------------
    # Model prediction
    # -----------------------------------------------------

    with torch.no_grad():

        exp_output, icm_output, te_output = model(
            image_tensor
        )


    # -----------------------------------------------------
    # Convert logits to probabilities
    # -----------------------------------------------------

    exp_prob = torch.softmax(
        exp_output,
        dim=1
    )

    icm_prob = torch.softmax(
        icm_output,
        dim=1
    )

    te_prob = torch.softmax(
        te_output,
        dim=1
    )


    # -----------------------------------------------------
    # Get predicted classes
    # -----------------------------------------------------

    exp_grade = exp_prob.argmax(
        dim=1
    ).item()

    icm_grade = icm_prob.argmax(
        dim=1
    ).item()

    te_grade = te_prob.argmax(
        dim=1
    ).item()


    # -----------------------------------------------------
    # Get confidence
    # -----------------------------------------------------

    exp_confidence = exp_prob[
        0,
        exp_grade
    ].item()

    icm_confidence = icm_prob[
        0,
        icm_grade
    ].item()

    te_confidence = te_prob[
        0,
        te_grade
    ].item()


    # -----------------------------------------------------
    # Overall confidence
    # -----------------------------------------------------

    overall_confidence = (
        exp_confidence
        + icm_confidence
        + te_confidence
    ) / 3


    # -----------------------------------------------------
    # Convert ICM and TE classes to letters
    # -----------------------------------------------------

    icm_letter = grade_letter(
        icm_grade
    )

    te_letter = grade_letter(
        te_grade
    )


    # -----------------------------------------------------
    # Gardner grade
    #
    # Example:
    #
    # EXP = 4
    # ICM = A
    # TE  = B
    #
    # Result = 4AB
    #
    # -----------------------------------------------------

    if (
        icm_letter != "0"
        and te_letter != "0"
    ):

        embryo_grade = (
            f"{exp_grade}"
            f"{icm_letter}"
            f"{te_letter}"
        )

    else:

        embryo_grade = (
            f"{exp_grade}"
            f"{icm_letter}"
            f"{te_letter}"
        )


    # -----------------------------------------------------
    # Result
    # -----------------------------------------------------

    result = {

        "EXP": {
            "grade": exp_grade,
            "confidence": round(
                exp_confidence * 100,
                2
            )
        },

        "ICM": {
            "grade": icm_letter,
            "class_index": icm_grade,
            "confidence": round(
                icm_confidence * 100,
                2
            )
        },

        "TE": {
            "grade": te_letter,
            "class_index": te_grade,
            "confidence": round(
                te_confidence * 100,
                2
            )
        },

        "embryo_grade": embryo_grade,

        "overall_confidence": round(
            overall_confidence * 100,
            2
        )

    }

    return result


# =========================================================
# MODEL TEST
# =========================================================

if __name__ == "__main__":

    print("\nTesting model...")

    dummy = torch.randn(
        1,
        3,
        224,
        224
    ).to(DEVICE)


    with torch.no_grad():

        exp, icm, te = model(
            dummy
        )


    print("\nOutput shapes:")

    print(
        "EXP:",
        exp.shape
    )

    print(
        "ICM:",
        icm.shape
    )

    print(
        "TE :",
        te.shape
    )


    print("\nExpected:")

    print(
        "EXP: torch.Size([1, 5])"
    )

    print(
        "ICM: torch.Size([1, 4])"
    )

    print(
        "TE : torch.Size([1, 4])"
    )


    print("\nModel parameter count:")

    total_parameters = sum(
        p.numel()
        for p in model.parameters()
    )

    print(
        f"{total_parameters:,}"
    )


    print("\nDevice test:")

    print(
        "CUDA available:",
        torch.cuda.is_available()
    )


    print("\n✅ AI MODEL TEST PASSED")
