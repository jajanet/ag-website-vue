<template>
  <div class="tabs-demo">

    <div class="outside">
      <button class="add-tab-button" type="button" @click="add_tab()">Add tab</button>

      <br> <br>
      <div class="shrink-tabs">
        <p> Current Tab Index = {{current_tab_index_1}}</p>
        <p class="tab-styling-theme-label"> GRAY THEME </p>
        <p> These tab-headings have overflow: hidden and a set height. </p>
        <tabs ref="tabs-gray" v-model="current_tab_index_1"
              tab_active_class="gray-theme-active"
              tab_inactive_class="gray-theme-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <div class="tab-heading"> Tab {{tab_val}} is a long tab</div>
              <i class="fas fa-times close-x"
                  @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-gray">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <p class="tab-styling-theme-label"> Tab with a Dropdown </p>
        <tabs ref="tabs-gray-no-padding" v-model="current_tab_index_2"
              tab_active_class="gray-theme-active-no-padding"
              tab_inactive_class="gray-theme-inactive-no-padding">
          <tab>
            <tab-header>

              <dropdown ref="countries_dropdown"
                        :items="countries"
                        @update_item_selected="country_selected = $event">
                <template slot="header">
                  <div class="tab-label" tabindex="0">
                    <p class="tab-heading-dropdown-tabs"
                       ref="edit_roster_tab"
                       @click.stop="show_countries_dropdown">
                      {{country_selected}}
                    </p>
                  </div>
                </template>
                <div slot-scope="{item}">
                  <div class="edit-rosters-dropdown-row-content">
                    <span>{{item}}</span>
                  </div>
                </div>
              </dropdown>

            </tab-header>

            <template slot="body">
              <div class="tab-body-gray-no-padding">
              </div>
            </template>
          </tab>
          <tab>
            <tab-header>
              <div class="tab-heading-dropdown-tabs"> Another tab </div>
            </tab-header>
            <template slot="body">
              <div class="tab-body-gray-no-padding">
                Happy Holidays
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <p class="tab-styling-theme-label"> GRAY-WHITE THEME </p>
        <tabs ref="tabs-gray-white" v-model="current_tab_index_3"
              tab_active_class="gray-white-theme-active"
              tab_inactive_class="gray-white-theme-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <div class="tab-heading"> Tab {{tab_val}} </div>
              <i class="fas fa-times close-x"
                 @click.stop="remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-gray-white">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <p class="tab-styling-theme-label"> NO BORDER THEME </p>
        <tabs ref="tabs-no-border" v-model="current_tab_index_4"
              tab_active_class="no-border-active"
              tab_inactive_class="no-border-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <div class="tab-heading"> Tab {{tab_val}} </div>
              <i class="fas fa-times close-x"
                 @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-no-border">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <p class="tab-styling-theme-label"> DARK THEME </p>
        <tabs ref="tabs-dark" v-model="current_tab_index_5"
              tab_active_class="dark-theme-active"
              tab_inactive_class="dark-theme-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <div class="tab-heading"> Tab {{tab_val}} </div>
              <i class="fas fa-times close-x"
                 @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-dark">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <p> This one uses the default styling </p>
        <p class="tab-styling-theme-label"> WHITE THEME </p>
        <tabs ref="tabs-white">
          <tab>
            <tab-header v-on:click="log_event">
              <span class="div-not-bare"> Tab 1 </span>
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
              </div>
            </template>
          </tab>
          <tab>
            <tab-header v-on:click.native="log_event">
              <span class="div-not-bare"> Tab 2 </span>
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
                Bye 2
              </div>
            </template>
          </tab>
          <tab>
            <tab-header @click.native="log_event">
              Bare Text Tab 3
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
                The tab header has just text
              </div>
            </template>
          </tab>
          <tab>
            <tab-header @click.native="log_event">
              Bare Text Tab 4
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
                The tab header has just text
              </div>
            </template>
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

  import { Component, Vue } from 'vue-property-decorator';

  import Dropdown from '@/components/dropdown.vue';
  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import ViewFile from '@/components/view_file.vue';

  @Component({
    components: {Dropdown, Tabs, TabHeader, Tab, ViewFile}
  })
  export default class TabsDemo extends Vue {
    countries = ["France", "Norway", "Spain"];
    country_selected = "France";
    current_tab_index_1 = 1;
    current_tab_index_2 = 1;
    current_tab_index_3 = 1;
    current_tab_index_4  = 1;
    current_tab_index_5 = 1;
    tab_labels = [1, 2, 3];

    show_countries_dropdown() {
      let countries_dropdown = <Dropdown> this.$refs.countries_dropdown;
      countries_dropdown.show();
    }

    log_event(e: Event) {
      console.log(e);
    }

    add_tab() {
      this.tab_labels.push(this.tab_labels.length + 1);
      this.current_tab_index_1 = this.tab_labels.length - 1;
    }

    remove_tab(index: number) {
      if (index < this.current_tab_index_1) {
        this.current_tab_index_1 -= 1;
      }
      this.tab_labels.splice(index, 1);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';

.add-tab-button {
  border: 2px solid lighten($stormy-gray-dark, 5);
  background-color: $stormy-gray-dark;
  border-radius: 5px;
  color: white;
  font-size: 15px;
  font-weight: bold;
  margin: 10px;
  outline: none;
  padding: 10px;
}

.add-tab-button:active {
  background-color: darken($stormy-gray-dark, 10);
}

.tab-label {
  outline: none;
}

.close-x:hover {
  color: $warning-red;
  cursor: pointer;
}

.close-x {
  background-color: inherit;
  font-size: 18px;
  padding: 12px 15px;
  position: absolute;
  right: 6px;
  top: 5.5px;
}

.tab-body {
  background-color: white;
  bottom: 0;
  height: 500px;
  padding: 10px;
  position: relative;
}

.tab-body-gray, .tab-body-gray-no-padding {
  @extend .tab-body;
  border: 2px solid $stormy-gray-dark;
}

.tab-body-gray-white {
  @extend .tab-body;
  border: 2px solid $pebble-medium;
}

.tab-body-dark{
  @extend .tab-body;
  border: 2px solid darken($stormy-gray-dark, 25);
}

.tab-body-no-border {
  @extend .tab-body;
}

.tab-body-white {
  @extend .tab-body;
  border: 2px solid $pebble-medium;
}

.tab-heading {
  height: 19px;
  margin: 0;
  overflow: hidden;
}

.tab-heading-dropdown-tabs {
  margin: 0;
  height: 19px;
  padding: 18px 20px;
  overflow: hidden;
}

.shrink-tabs {
  margin-left: 10%;
  margin-right: 10%;
  width: 80%;
}

.tab-styling-theme-label {
  background-color: $pebble-light;
  border: 2px dashed $pebble-dark;
  display: inline-block;
  padding: 10px;
}

@media only screen and (min-width: 481px) {
    .close-x {
      background-color: inherit;
      font-size: inherit;
      padding: 3px 5px;
      right: 6px;
      top: 8px;
    }

    .tab-heading-dropdown-tabs {
      padding: 10px 15px;
    }
}

</style>
