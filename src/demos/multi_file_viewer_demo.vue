<template>
  <div class="multi-file-viewer-demo">

    <div>
      <p>
        <b>The height of the multi_file_viewer is determined by the view_files
           inside of it. The 'height_of_view_file' variable specifies the height
           in this example of the m.f.v </b>
      </p>
      <p class="btn fruits" @click="open_file_1('Apple')"> Add A </p>
      <p class="btn fruits" @click="open_file_1('Banana')"> Add B </p>
      <p class="btn fruits" @click="open_file_1('Cantaloupe')"> Add C </p>
      <p class="btn fruits" @click="open_file_1('Dragonfruit')"> Add D </p>
      <p class="btn fruits" @click="open_file_1('Grapes')"> Add E </p>
      <div class="mvf-container">
        <multi-file-viewer
          ref="multi_file"
          :height_of_view_file="height_of_view_file">
        </multi-file-viewer>
      </div>
    </div>

    <div>
      <p>
        <b>
          In this example of the multi-file-viewer the view_files
          inside of it resort to their default height.
        </b>
      </p>
      <p class="btn letters" @click="open_file_2('A')"> Add A </p>
      <p class="btn letters" @click="open_file_2('B')"> Add B </p>
      <p class="btn letters" @click="open_file_2('C')"> Add C </p>
      <div class="mvf-container">
        <multi-file-viewer
          ref="multi_file2">
        </multi-file-viewer>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import MultiFileViewer from '@/components/multi_file_viewer.vue';
import { SafeMap } from "@/safe_map";

@Component({
  components: { MultiFileViewer }
})
export default class MultiFileViewerDemo extends Vue {

  files_and_content = new SafeMap<string, string>([
      ['A', 'Aurora\nAurora'],
      ['B', 'Belle'],
      ['C', 'Cinderella\nCinderella\nCinderella'],
      ['Apple', 'Apples:\n\tRed\n\tGreen\n\tYellow'],
      ['Banana', 'Beetlejuice\nBeetlejuice\nBeetlejuice'],
      ['Cantaloupe', 'Cantaloupe'],
      ['Dragonfruit', 'Dragonfruit\nDragonfruit\nDragonfruit\nDragonfruit'],
      ['Grapes', 'Green Grapes\nPurple Grapes']
  ]);

  open_file_1(file_in: string) {
    let mfv = <MultiFileViewer> this.$refs.multi_file;
    let my_promise: Promise<string> = Promise.resolve(this.files_and_content.get(file_in));
    mfv.add_to_viewing(file_in, my_promise);
  }

  open_file_2(file_in: string) {
    let mfv = <MultiFileViewer> this.$refs.multi_file2;
    let my_promise: Promise<string> = Promise.resolve(this.files_and_content.get(file_in));
    mfv.add_to_viewing(file_in, my_promise);
  }
  height_of_view_file = "350px";
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.btn {
  border-radius: 5px;
  color: white;
  cursor: pointer;
  display: inline-block;
  margin-right: 10px;
  padding: 20px;
}

.mvf-container {
  width: 90%;
}

.fruits {
  background-color: $ocean-blue;
}

.letters {
  background-color: mediumpurple;
}

.multi-file-viewer-demo {
  padding: 20px 15px;
}

</style>
