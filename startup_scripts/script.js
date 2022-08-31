// priority: 0

onEvent("computercraft.peripheral", event => {
	event.registerPeripheral("tis3d:casing", "tis3d:casing")
		.mainThreadMethod("getModule", (container, dir, args) => {
			return global.getModule(container, dir, args)
		})
		.mainThreadMethod("setCode", (container, dir, args) => {
			return global.setCode(container, dir, args)
		})
		.mainThreadMethod("updateMemory", (container, dir, args) => {
			return global.updateMemory(container, dir, args)
		})
		.mainThreadMethod("getPos", (container, dir, args) => {
			return global.getPos(container, dir, args)
		})
})


