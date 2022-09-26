# TIS-3D CC:Tweaked integration

This mod addon adds an API to CC:Tweaked to interact with TIS-3D devices.

Following blocks are recognized as peripherals:

## TIS-3D casing

Most functions take `side` as their first argument. Valid values are: `"bottom"`, `"top"`, `"north"`, `"south"`, `"west"`, `"east"`.

### getPos(): table

Returns table with fields `x`, `y`, `z` indicating the position of casing in the world (useful for figuring out the physical layout of casings) and fields `success` and `reason`, indicating whether the operation was successful and error reason (currently always succeeds).

### setCode(side: string, code: string): table

Replaces the code on an execution module at the specified `side` with `code`. Returns table with fields `success` and `reason`, indicating whether the operation was successful and error reason.

### updateMemory(side: string, data: table): table

**Partially** replaces contents of RAM or ROM at the specified `side`. Only bytes which have a corresponding index in `data` will be replaced. Indices are numbered starting from 1 (as per standard Lua conventions) up to 256. Values are treated as unsigned bytes in range from 0 to 255 (both inclusive).

E.g. if one wishes to replace bytes at addresses 13, 17 and 42 only, `data` should look like this (notice the +1 offset since TIS-3D addressing is 0-based):
```Lua
{
    [14] = 0xde,
    [18] = 0xad,
    [43] = 0xbe
}
```

To replace contents of the whole memory, `data` should contain the whole range of keys from 1 to 256 (both inclusive).

Returns table with fields `success` and `reason`, indicating whether the operation was successful and error reason.

### getModule(side: string): module: table

Returns table with info about module at the specified `side`. Contents of the returned table differ depending on the queried module. Detailed info can be found in [Available module info](module-info.md)

### getPipes(): table

Returns a table with a field `state` which is a table containing exactly 24 elements specifying state of all pipes that the casing has. In addition, returned table has fields `success` and `reason`, indicating whether the operation was successful and error reason (currently always succeeds). A pipe is a communication interface to neighbouring modules. Every pipe can be read from or written to by modules to transfer data between them. Each pipe's state is a table consisting of fields:
| Field      | Type  | Description                      |
| ---------- | ----- | -------------------------------- |
| value      | short | Value which is being transferred |
| readState  | byte  | TBD                              |
| writeState | byte  | TBD                              |
