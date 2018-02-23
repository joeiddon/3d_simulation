import os 
with open("README.md", "w") as fh:
    fh.write("# Links to different versions and some testing applications\n")
    for f in sorted(os.listdir()):
        if ".html" in f:
            fh.write("- [{}](https://roadkillcat.github.io/3dSimulationVR/{})\n".format(f, f))
