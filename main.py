import time
import numpy as np
import openvino as ov
from openvino import opset13 as ops

core = ov.Core()
print("Devices:", core.available_devices)

C_IN, C_OUT, H, W = 64, 128, 224, 224

inp = ops.parameter([1, C_IN, H, W], np.float32, name="input")
w = ops.constant((np.random.randn(C_OUT, C_IN, 3, 3) * 0.05).astype(np.float32))
conv = ops.convolution(inp, w, strides=[1, 1], pads_begin=[1, 1],
                       pads_end=[1, 1], dilations=[1, 1])
model = ov.Model([ops.relu(conv)], [inp], "big_conv")

x = np.random.rand(1, C_IN, H, W).astype(np.float32)   # phải khớp C_IN
results = {}

for dev in core.available_devices:
    try:
        t0 = time.time()
        compiled = core.compile_model(model, dev)
        print(f"\n[{dev}] compile: {time.time() - t0:.2f}s")

        for _ in range(5):                       # warm-up
            compiled(x)
        n = 30
        t0 = time.time()
        for _ in range(n):
            out = compiled(x)[0]
        ms = (time.time() - t0) / n * 1000
        results[dev] = out
        print(f"[{dev}] {ms:.2f} ms/inference, output shape {out.shape}")
    except Exception as e:
        print(f"[{dev}] Lỗi: {e}")

if "CPU" in results:
    for dev, out in results.items():
        print(f"{dev} vs CPU max diff: {np.abs(out - results['CPU']).max():.5f}")