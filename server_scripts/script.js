// priority: 0

settings.logAddedRecipes = true
settings.logRemovedRecipes = true
settings.logSkippedRecipes = false
settings.logErroringRecipes = true

const sideIndexes = {bottom: 0, top: 1, north: 2, south: 3, west: 4, east: 5} 
const getModule = {
	"tis3d:execution_module": getExecModule,
	"tis3d:random_access_memory_module": getMemModule,
	"tis3d:read_only_memory_module": getMemModule,
	"tis3d:audio_module": getGenericModule,
	"tis3d:display_module": getDisplayModule,
	"tis3d:facade_module": getGenericModule,
	"tis3d:infrared_module": getIRModule,
	"tis3d:keypad_module": getGenericModule,
	"tis3d:queue_module": getQueueModule,
	"tis3d:random_module": getGenericModule,
	"tis3d:redstone_module": getRedstoneModule,
	"tis3d:sequencer_module": getSequencerModule,
	"tis3d:serial_port_module": getSerialModule,
	"tis3d:stack_module": getStackModule,
	"tis3d:terminal_module": getTerminalModule,
	"tis3d:timer_module": getTimerModule,
}

function toJsArray(arr) {
	let jsArr = []
	for (var i = 0; i < arr.length; i++)
		jsArr[i] = arr[i]
	return jsArr
}

function getModuleNbt(container, side) {
	let modules = container.entityData.get("casing").get("modules")
	return modules[side]
}

function getModuleName(container, side) {
	let moduleNames = container.entityData.get("inventory").get("inventory")
	return moduleNames[side].getString("id")
}

function getSide(args) {
	let sideStr = args.getString(0)
	if (sideStr in sideIndexes)
		return sideIndexes[sideStr]
}

function setModuleNbt(container, side, nbt) {
	let modules = container.entityData.get("casing").get("modules")
	modules[side] = nbt
	console.info(modules[side])
	container.entityData = container.entityData.merge({ casing: { modules: modules }})
}

function getExecModule(nbt) {
	let machine = nbt.get("machine")
	return {
		acc: machine.getShort("acc"),
		bak: machine.getShort("bak"),
		pc: machine.getInt("pc"),
		pcprev: machine.getInt("pcPrev"),
		code: machine.getString("code"),
		state: nbt.getByte("state")
	}
}

function getMemModule(nbt) {
	let data = nbt.getByteArray("memory")
	let jsData = []

	for (var i = 0; i < data.length; i++)
		jsData[i] = data[i] < 0 ? -(data[i] ^ 0xff) - 1 : data[i] // convert to unsigned

	return {
		data: jsData,
		address: nbt.getByte("address"),
		state: nbt.getByte("state")
	}
}

function getGenericModule(nbt) {
	return {}
}

function getDisplayModule(nbt) {
	return {
		image: toJsArray(nbt.getIntArray("image")),
		drawcall: toJsArray(nbt.getByteArray("drawCall")),
		state: nbt.getByte("state")
	}
}

function getIRModule(nbt) {
	return {
		queue: toJsArray(nbt.getIntArray("receiveQueue"))
	}
}

function getQueueModule(nbt) {
	return {
		queue: toJsArray(nbt.getIntArray("queue")),
		head: nbt.getInt("head"),
		tail: nbt.getInt("tail")
	}
}

function getRedstoneModule(nbt) {
	return {
		input: nbt.getInt("input"),
		output: nbt.getInt("output")
	}
}

function getSequencerModule(nbt) {
	let sequence = []
	let sequenceNum = nbt.getLong("configuration")

	for (var i = 0; i < 8; i++)
		sequence[i] = sequenceNum & (0xff << (i*8))

	return {
		sequence: sequence,
		position: nbt.get("position"),
		delay: nbt.get("delay"),
		remaining: nbt.get("stepsRemaining")
	}
}

function getSerialModule(nbt) {
	return {
		value: nbt.get("value")
	}
}

function getStackModule(nbt) {
	return {
		stack: toJsArray(nbt.getIntArray("stack")),
		top: nbt.getInt("top")
	}
}

function getTerminalModule(nbt) {
	return {
		output: nbt.getString("output"),
		display: toJsArray(nbt.getStringArray("display"))
	}
}

function getTimerModule(nbt) {
	return {
		timer: nbt.getLong("timer")
	}
}


function setCode(container, side, code) {
	let module = getModuleNbt(container, side)
	setModuleNbt(container, side, module.merge({ machine: { code: code }}))
}

function setRAMData(container, side, data) {
	let module = getModuleNbt(container, side)
	module.putByteArray("memory", data)
	setModuleNbt(container, side, module)
}

function setROMData(container, side, data) {
	setRAMData(container, side, data)

	// data contained in ROM module is duplicated in two places for some reason
	// updating it also here to not cause any unexpected behavior
	let inventories = container.entityData.get("inventory").get("inventory")
	let romTag = inventories[side].get("tag")
	romTag.putByteArray("data", data)
	container.entityData = container.entityData.merge({ inventory: { inventory: inventories }})
}

global.setCode = (container, dir, args) => {
	let side = getSide(args)	
	let name = getModuleName(container, side)
	let code = args.getString(1)

	if (name.equals("tis3d:execution_module")) {
		setCode(container, side, code)
		return null
	} else return false
}

global.updateMemory = (container, dir, args) => {
	let side = getSide(args)
	let name = getModuleName(container, side)
	let module = getModuleNbt(container, side)
	let data = args.getTable(1)
	let memData = module.getByteArray("memory")

	data.forEach((addr, val) => {
		memData[addr-1] = val > 127 ? -(val ^ 0xff) - 1 : val	// convert to signed
	});

	if (name.equals("tis3d:random_access_memory_module"))
		setRAMData(container, side, memData)
	else if (name.equals("tis3d:read_only_memory_module"))
		setROMData(container, side, memData)
}

global.getModule = (container, dir, args) => {
	let side = getSide(args)
	let name = getModuleName(container, side)
	let module = getModuleNbt(container, side)
	let moduleData = getModule[name](module)
	moduleData.name = name.replace("tis3d:", "")
	return moduleData
}

global.getPos = (container, dir, args) => {
	return {
		x: container.x,
		y: container.y,
		z: container.z
	}
}
