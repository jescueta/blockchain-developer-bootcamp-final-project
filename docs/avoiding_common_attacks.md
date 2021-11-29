# Avoiding Common Attacks

### SWC-103 - Floating Pragma
Fixed pragma to 0.8.0 to avoid bug inclusions from outdated compilers.

### SWC-104 - Unchecked call return value
All external transfer calls are checked with require during the royalty payment in the `_payRoyalty` function.

### SWC-129 - Typographical Error
SafeMath was used for calculation in order to minimize the risk for calculation errors.

### Modifiers Used Only for Validation
Used `onlyOwner` modifier which just uses require for validation.

### Check Effects Interaction
External calls during royalty payments in the `_payRoyalty` function are all done at the end without any subsequent mutations.
