<template>
	<img class="icon" :width="width" :height="height" alt="" :src="icon">
</template>

<script>
// export default {
module.exports = {
	name: "AppIcon",
	props: {
		icon: {
			type: String,
			required: true,
		},
		width:{
			type: Number,
			default: 64,
		},
		height:{
			type: Number,
			default: 64,
		}
	},
};
</script>

<style>
svg.icon {
	display: inline-block;
	fill: currentColor;
	vertical-align: middle;
}
</style>