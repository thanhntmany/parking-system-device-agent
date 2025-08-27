# Parking System
> This is just a temporary name.

## Development guideline
- To ensure flexibility and cost optimization, this system is built with a focus on running in the linux-like systems.
- Each sub project should able to be packaged as a .deb file. This will allow it to be installed using the `apt` or `dpkg`, which will also make it simple to run OTA updates.
- This project is build under on-premise fist oriented. Therefore, make sure it would work independent before linking to the others things.NOTE: 


This app is built on 3 tier layer architecture:
- data
- logic
- presentation:
    + CLI
    + Website

