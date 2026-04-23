"""
GPTT-77 - Export modèle ONNX pour inférence optimisée
"""
import onnx
import tensorflow as tf
import tf2onnx


def export_to_onnx(model_path: str, output_path: str):
    """Convertit le modèle Keras en ONNX"""
    model = tf.keras.models.load_model(model_path)
    input_signature = [tf.TensorSpec(model.inputs[0].shape, tf.float32)]
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=input_signature)
    onnx.save(model_proto, output_path)
    print(f"Modèle exporté en ONNX : {output_path} ✅")


if __name__ == "__main__":
    export_to_onnx('app/ai/ml/thermotwin_model.keras', 'app/ai/ml/thermotwin_model.onnx')