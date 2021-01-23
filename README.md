# uuid-cli
Command-line tool for generating and validating UUIDs.

## Installation

    > npm install -g @lbergeron/uuid-cli

## Generating a random UUID

Simply call the executable with no arguments. A random UUID v4 will be generated and copied to the clipboard.

    > uuid
    
    8de8ac0e-a75d-41af-a982-c35d30b36670

## Generating a scoped UUID

To generate a scoped UUID using a name and namespace, you can call the executable like this.

    > uuid --ns 8de8ac0e-a75d-41af-a982-c35d30b36670 --name "Put the name here"

    b6103b34-ba45-5a81-8399-f41e7a5b0d6a

If you omit the `ns` argument, a random namespace UUID will be generated.
