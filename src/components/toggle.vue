<template>
  <div id="toggle-button-space">
    <div v-if="is_on" class="active-option-style on-border"
         :style="[{backgroundColor: active_background_color}]">
      <slot name="on"> </slot>
    </div>
    <div v-else @click="_toggle()" class="inactive-option-style on-border cursor-pointer">
      <slot name="on"> </slot>
    </div>

    <div v-if="is_on" @click="_toggle()" class="inactive-option-style off-border">
      <slot name="off"> </slot>
    </div>
    <div v-else class="active-option-style off-border"
         :style="[{backgroundColor: active_background_color}]">
      <slot name="off"> </slot>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Toggle extends Vue {

  @Prop({default: false, type: Boolean})
  value!: boolean;

  @Watch('value')
  on_value_changed(new_value: boolean, old_value: boolean) {
    this.is_on = new_value;
  }

  @Prop({default: 'hsl(208, 59%, 49%)', type: String})
  active_background_color!: string;

  is_on: boolean = false;

  created() {
    this.is_on = this.value;
  }

  private _toggle() {
    this.is_on = !this.is_on;
    this.$emit('input', this.is_on);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.active-option-style {
  box-shadow: 0 1px 1px $dark-gray;
  color: white;
  display: inline-block;
  font-weight: normal;
  opacity: 1;
  z-index: 4;
  padding: 8px 12px 7.5px 12px;
}

.inactive-option-style {
  box-shadow: inset 1px 1px 3px $dark-gray;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: normal;
  opacity: 1;
  z-index: 3;
  padding: 8px 12px 7.5px 12px;
  background-color: white;
}

.active-option-style p, .inactive-option-style p {
  margin: 0;
}

.off-border {
  border-radius: 0 3px 3px 0;
}

.on-border {
  border-radius: 3px 0 0 3px;
}

#toggle-button-space {
  border-radius: 3px;
  display: inline-block;
  z-index: 4;
}

</style>
