<template>
  <div id="file-upload-container">
    <input ref="file_input"
           id="file-input"
           type="file"
           @change="add_files_from_button($event)"
           multiple>
    <div id="drag-and-drop"
         :class="{'drag-and-drop-hover': d_files_dragged_over}"
         @dragenter="d_files_dragged_over = true"
         @dragleave="d_files_dragged_over = false"
         @dragover="on_file_hover($event)"
         @drop="add_dropped_files($event)">
      <div id="drag-and-drop-body">

        <div id="drop-here">Drop files here</div>
        <div id="or">- or -</div>
        <button id="add-files-button"
                @click="$refs.file_input.click()">
          <div> Choose your files </div>
        </button>

      </div>
    </div>

    <table v-if="d_files.size() >= 1"
           class="student-files-uploaded-table">
      <thead>
        <tr>
          <th class="name-of-file-label"><slot name="file_list_label">Files to Upload</slot></th>
          <th class="size-of-file-label">Size</th>
          <th class="remove-file-label">Remove</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) of d_files.data" :class="table_row_styling(file, index)"
            :key="file.name">
          <td class="name-of-file">{{file.name}}</td>
          <td class="size-of-file">{{file.size}} Bytes</td>
          <td class="remove-file">
            <div class="fas fa-times remove-file-button"
                 :title="'Remove ' + file.name"
                 @click="remove_file_from_upload(file.name, index)"
                 :class="file.size === 0 ? 'remove-button-icon-empty-file'
                                         : 'remove-button-icon-non-empty-file'">
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <button class="upload-files-button"
            :disabled="d_files.empty()"
            @click="attempt_to_upload()">
      <slot name="upload_button_text">Upload Files</slot>
    </button>

    <modal ref="empty_file_found_in_upload_attempt"
           size="large"
           :include_closing_x="false">
      <div class="modal-header">Empty Files detected</div>
      <hr>
      <div class="modal-body">
        <p class="empty-file-list-label"> The following files are empty: </p>
        <ul class="list-of-empty-file-names">
          <li v-for="empty_file of d_empty_filenames.data">
            <i class="fas fa-exclamation-triangle empty-warning-symbol"></i>
            {{empty_file}}
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button class="upload-despite-empty-files-button gray-button"
                @click="continue_with_upload_despite_empty_files()"> Upload Anyway
        </button>
        <button class="cancel-upload-process-button red-button"
                @click="$refs.empty_file_found_in_upload_attempt.close()"> Cancel
        </button>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import { ArraySet } from '@/array_set';
  import Modal from '@/components/modal.vue';

  interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
  }

  type HasName = {name: string};
  function name_less(first: HasName, second: HasName) {
    return first.name < second.name;
  }

  @Component({
    components: { Modal }
  })
  export default class FileUpload extends Vue {

    d_files: ArraySet<File, HasName> = new ArraySet<File, HasName>([], {less_func: name_less});
    d_files_dragged_over = false;
    d_empty_filenames: ArraySet<string> = new ArraySet<string>([]);

    table_row_styling(file_in: File, row_index: number): string {
      if (file_in.size === 0) {
        return "file-empty-row";
      }
      if (row_index % 2 !== 0) {
        return "file-not-empty-row-odd";
      }
      return "file-not-empty-row-even";
    }

    add_files_from_button(event: HTMLInputEvent) {
      if (event.target === null) {
        throw new Error("Target is null");
      }
      if (event.target.files === null) {
        throw new Error("Files property of event target is unexpectedly null");
      }
      for (let file of event.target.files) {
        this.add_or_update_file(file);
        this.check_for_emptiness(file);
      }
      event.target.value = '';
    }

    add_dropped_files(event: DragEvent) {
      event.stopPropagation();
      event.preventDefault();
      if (event.target === null) {
        throw new Error("Target is null");
      }
      for (let file of event.dataTransfer.files) {
        this.add_or_update_file(file);
        this.check_for_emptiness(file);
      }
      this.d_files_dragged_over = false;
    }

    remove_file_from_upload(filename: string, file_index: number) {
      this.d_files.remove({name: filename});
      this.d_empty_filenames.remove(filename, false);
    }

    attempt_to_upload() {
      if (!this.d_empty_filenames.empty()) {
        let empty_files_modal = <Modal> this.$refs.empty_file_found_in_upload_attempt;
        empty_files_modal.open();
      }
      else {
        this.$emit('upload_files', this.d_files.data);
      }
    }

    continue_with_upload_despite_empty_files() {
      this.$emit('upload_files', this.d_files.data);
      let empty_files_modal = <Modal> this.$refs.empty_file_found_in_upload_attempt;
      empty_files_modal.close();
    }

    add_or_update_file(uploaded_file: File) {
      this.d_files.remove(uploaded_file, false);
      this.d_empty_filenames.remove(uploaded_file.name, false);
      this.d_files.insert(uploaded_file);
    }

    check_for_emptiness(file: File) {
      if (file.size === 0) {
        this.d_empty_filenames.insert(file.name);
      }
    }

    on_file_hover(event: DragEvent) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }

    clear_files() {
      this.d_files = new ArraySet<File, HasName>([], {less_func: name_less});
      this.d_empty_filenames = new ArraySet<string>([]);
    }
  }


</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

* {
  box-sizing: border-box;
}

#file-input {
  display: none;
}

#drag-and-drop {
  align-items: center;
  border-radius: 5px;
  border: 2px solid $ocean-blue;
  display: flex;
  height: 250px;
  justify-content: center;
  position: relative;
  text-align: center;
  width: 100%;
}

.drag-and-drop-hover {
  background-color: $pebble-light;
}

#drop-here {
  font-size: x-large;
}

#or {
  font-size: medium;
  padding: 0 0 5px 0;
}

#add-files-button {
  @extend .blue-button;
  border: none;
  color: white;
  font-size: large;
}

table {
  border-collapse: collapse;
  margin-top: 10px;
  width: 100%;
}

th {
  border-bottom: 2px solid hsl(210, 20%, 92%);
  font-size: 16px;
  text-align: left;
  padding: 7px 15px;
}

td {
  border-bottom: 1px solid hsl(210, 20%, 94%);
  font-size: 16px;
  padding: 2px 15px;
}

.remove-file {
  width: 50px;
  text-align: center;
}

.file-empty-row {
  background-color: $warning-red;
  border-radius: 10px;
  color: white;
}

.file-not-empty-row-odd {
  background-color: white;
}

.file-not-empty-row-even {
  background-color: hsl(210, 20%, 96%);
}

.remove-file-button {
  padding: 10px 15px;
}

.remove-button-icon-non-empty-file {
  color: hsl(212, 10%, 47%);
  cursor: pointer;
}

.remove-button-icon-non-empty-file:hover {
  color: hsl(212, 50%, 22%);
}

.remove-button-icon-empty-file {
  color: white;
  cursor: pointer;
}

.upload-files-button {
  @extend .green-button;
  margin-top: 20px;
}

/**** Modal *******************************************************************/

.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.modal-body {
  padding: 10px 0 0 0;
}

.modal-footer {
  text-align: right;
}

.empty-file-list-label {
  margin: 0 10px 0 0;
  padding: 0;
  display: inline-block;
}

.upload-despite-empty-files-button {
  margin-right: 15px;
}

.empty-warning-symbol {
  color: orange;
  padding-right: 5px;
}

.list-of-empty-file-names {
  padding: 0;
  margin: 0 0 30px 0;
  display: inline-block;
  vertical-align: top;
}

.list-of-empty-file-names li {
  color: black;
  list-style-type: none;
  margin-bottom: 2px;
  margin-left: 10px;
  padding-bottom: 5px;
}

.list-of-empty-file-names li:last-child {
  margin-bottom: 15px;
}

</style>
