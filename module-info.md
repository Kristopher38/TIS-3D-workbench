# Available module info

This document lists information that can be queried with the `getModule` function. All queried data is returned in a table with key-value pairs.

In addition to the module-specific data specified below, all modules also return their name under the key `name`, boolean `success` indicating an error/success of the call and `reason` containing explanation of the error, if there was any.

## Execution module

| Property | Type   | Description                                    |
| -------- | ------ | ---------------------------------------------- |
| acc      | number | Value the accumulator                          |
| bak      | number | Value the BAK register                         |
| pc       | number | Value of the internal program counter          |
| pcprev   | number | Previous value of the internal program counter |
| code     | string | Code stored on the module                      |
| state    | number | TBD                                            |

## RAM/ROM module

| Property | Type   | Description                                                 |
| -------- | ------ | ----------------------------------------------------------- |
| data     | table  | Memory contents as a table of bytes (indexed from 1 to 256) |
| address  | number | Address for the currently pending memory operation          |
| state    | number | TBD                                                         |

## Audio module

## Display module

## Facade module

## Infrared module

## Keypad module

## Queue module

## Random module

## Redstone module

## Sequencer module

## Serial port module

## Stack module

## Terminal module

## Timer module