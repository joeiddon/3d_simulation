import os 

with open("README.md", "w") as fHandle:
    fHandle.write("# Links to the pages\n")
    for f in os.listdir():
        if ".html" in f:
            fHandle.write("- [{}](https://roadkillcat.github.io/3dSimulationVR/{})\n".format(f, f))
