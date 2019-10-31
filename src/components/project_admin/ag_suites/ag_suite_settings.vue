<template>
  <div id="ag-test-suite-settings-component" v-if="d_ag_test_suite !== null">
    <div v-if="!d_loading">
      <!------------------------ Suite Settings ------------------------------------->

      <validated-form id="ag-test-suite-settings-form"
                      autocomplete="off"
                      spellcheck="false"
                      @form_validity_changed="d_settings_form_is_valid = $event">

        <div id="ag-test-suite-name-container">
          <label class="text-label"> Suite name </label>
          <validated-input ref="suite_name"
                           id="input-name"
                           v-model="d_name"
                           @input="d_editing_suite_name_section = true"
                           :validators="[is_not_empty]">
          </validated-input>
        </div>

        <div class="checkbox-container">
          <input id="synchronous-or-deferred"
                 type="checkbox"
                 class="checkbox"
                 :checked="d_deferred"
                 @input="d_editing_suite_name_section = true"/>
          <label class="checkbox-label"
                 for="synchronous-or-deferred">
            Suite must finish before students can submit again
          </label>
        </div>

        <div class="save-button-container"
             v-if="d_editing_suite_name_section">

          <APIErrors ref="api_errors"></APIErrors>

          <button type="submit"
                  class="save-button-active"
                  :disabled="!d_settings_form_is_valid || d_saving"
                  @click="save_ag_test_suite_settings(AGSuiteSettingsSection.general)">Save</button>

          <button type="button"
                  class="cancel-button"
                  @click="reset_section(AGSuiteSettingsSection.general)"> Cancel </button>
        </div>

        <fieldset class="fieldset">
          <legend class="legend"> Grading Environment </legend>

          <div class="sandbox-container">
            <label class="text-label"> Sandbox environment </label>
            <div class="dropdown">
              <dropdown id="sandbox-docker-image"
                        :items="d_docker_images"
                        dropdown_height="250px"
                        @update_item_selected="d_editing_grading_environment = true;
                                                 d_sandbox_environment = $event">
                <template slot="header">
                  <div tabindex="0" class="dropdown-header-wrapper">
                    <div class="dropdown-header sandbox-docker-image-dropdown">
                      {{d_sandbox_environment === null ? ' '
                      : d_sandbox_environment.display_name}}
                      <i class="fas fa-caret-down dropdown-caret"></i>
                    </div>
                  </div>
                </template>
                <div slot-scope="{item}">
                  <span>
                    {{item.display_name}}
                  </span>
                </div>
              </dropdown>
            </div>
          </div>

          <div class="toggle-container">
            <toggle v-model="d_allow_network_access"
                    @input="d_editing_grading_environment = true"
                    ref="allow_network_access">
              <div slot="on">
                Allow network access
              </div>
              <div slot="off">
                Block network access
              </div>
            </toggle>
          </div>

          <div class="save-button-container-in-fieldset"
               v-if="d_editing_grading_environment">

            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                    class="save-button-active"
                    :disabled="!d_settings_form_is_valid || d_saving"
                    @click="save_ag_test_suite_settings(AGSuiteSettingsSection.grading_environment)">Save</button>

            <button type="button"
                    class="cancel-button"
                    @click="reset_section(AGSuiteSettingsSection.grading_environment)">Cancel</button>
          </div>

        </fieldset>

        <fieldset class="fieldset">
          <legend class="legend"> Instructor Files </legend>
          <div class="typeahead-search-bar">
            <dropdown-typeahead ref="instructor_files_typeahead"
                                placeholder_text="Enter a filename"
                                :choices="instructor_files_available"
                                :filter_fn="instructor_file_filter_fn"
                                @update_item_chosen="add_instructor_file($event)">
              <template slot-scope="{item}">
                  <span class="typeahead-row">
                    {{item.name}}
                  </span>
              </template>
            </dropdown-typeahead>
          </div>

          <div class="instructor-files" v-if="d_instructor_files_needed.length">
            <div v-for="(file, index) of d_instructor_files_needed"
                 :key="file.pk"
                 :class="['file', {'odd-index': index % 2 !== 0}]">
              <span class="file-name"> {{file.name}} </span>
              <div class="remove-file-icon-container"
                   @click="d_editing_instructor_files_section = true;
                              d_instructor_files_needed.splice(index, 1)">
                <span><i class="fas fa-times remove-file"></i></span>
              </div>
            </div>
          </div>

          <div class="save-button-container-in-fieldset"
               v-if="d_editing_instructor_files_section">

            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                    class="save-button-active"
                    :disabled="!d_settings_form_is_valid || d_saving"
                    @click="save_ag_test_suite_settings(AGSuiteSettingsSection.instructor_files)">Save</button>

            <button type="button"
                    class="cancel-button"
                    @click="reset_section(AGSuiteSettingsSection.instructor_files)"> Cancel </button>
          </div>

        </fieldset>

        <fieldset class="fieldset">
          <legend class="legend"> Student Files </legend>
          <!--          <div class="typeahead-search-bar">-->
          <!--            <dropdown-typeahead ref="student_files_typeahead"-->
          <!--                                placeholder_text="Enter a filename"-->
          <!--                                :choices="expected_student_files_available"-->
          <!--                                :filter_fn="expected_student_file_filter_fn"-->
          <!--                                @update_item_chosen="add_student_file($event)">-->
          <!--              <template slot-scope="{item}">-->
          <!--                <span class="typeahead-row">-->
          <!--                  {{item.pattern}}-->
          <!--                </span>-->
          <!--              </template>-->
          <!--            </dropdown-typeahead>-->
          <!--          </div>-->


<!--          <form-section>-->
<!--            <div class="student-files" v-if="d_student_files_needed.length">-->
<!--              <div v-for="(file, index) of d_student_files_needed"-->
<!--                   :key="file.pk"-->
<!--                   :class="['file', {'odd-index': index % 2 !== 0}]">-->
<!--                <span class="file-name"> <i class="fas fa-file-alt file-icon"></i> {{file.pattern}} </span>-->
<!--                <div class="remove-file-icon-container"-->
<!--                     @click="d_editing_student_files_section = true;-->
<!--                              d_student_files_needed.splice(index, 1)">-->
<!--                  <span><i class="fas fa-times remove-file"></i></span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </form-section>-->


          <div class="save-button-container-in-fieldset"
               v-if="d_editing_student_files_section">

            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                    class="save-button-active"
                    :disabled="!d_settings_form_is_valid || d_saving"
                    @click="save_ag_test_suite_settings(AGSuiteSettingsSection.student_files)">Save</button>

            <button type="button"
                    class="cancel-button"
                    @click="reset_section(AGSuiteSettingsSection.student_files)"> Cancel </button>
          </div>

        </fieldset>

        <fieldset class="fieldset">
          <legend class="legend"> Setup </legend>

          <div id="setup-command-label-container">
            <label class="text-label"> Setup command label </label>
            <validated-input ref="setup_suite_cmd_name"
                             v-model="d_setup_command_name"
                             @input="d_editing_setup_section = true"
                             :validators="[]">
            </validated-input>
          </div>

          <div id="setup-command-container">
            <label class="text-label"> Setup command </label>
            <validated-input ref="setup_suite_cmd"
                             v-model="d_setup_command"
                             @input="d_editing_setup_section = true"
                             :validators="[]">
            </validated-input>
          </div>

          <div class="save-button-container-in-fieldset"
               v-if="d_editing_setup_section">

            <APIErrors ref="api_errors"></APIErrors>

            <button type="button"
                    class="save-button-active"
                    :disabled="!d_settings_form_is_valid || d_saving"
                    @click="save_ag_test_suite_settings(AGSuiteSettingsSection.setup)">Save</button>

            <button type="button"
                    class="cancel-button"
                    @click="reset_section(AGSuiteSettingsSection.setup)"> Cancel </button>
          </div>

        </fieldset>

        <!------------------------ Feedback Settings ------------------------------------->

        <fieldset class="fieldset">
          <legend class="legend">Feedback</legend>
          <div class="config-panels-container">
            <feedback-config-panel ref="normal_config_panel"
                                   v-model="d_normal_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.normal}}
                  <i class="fas fa-question-circle input-tooltip">
                    <tooltip width="large" placement="right">
                      {{FeedbackDescriptions.normal}}
                    </tooltip>
                  </i>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings ref="normal_edit_feedback_settings"
                                                 v-model="d_normal_fdbk_config"
                                                 :config_name="FeedbackConfigLabel.normal">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>

            <feedback-config-panel ref="final_graded_config_panel"
                                   v-model="d_ultimate_submission_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.ultimate_submission}}
                  <i class="fas fa-question-circle input-tooltip">
                    <tooltip width="large" placement="right">
                      {{FeedbackDescriptions.ultimate_submission}}
                    </tooltip>
                  </i>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings
                  ref="final_graded_edit_feedback_settings"
                  v-model="d_ultimate_submission_fdbk_config"
                  :config_name="FeedbackConfigLabel.ultimate_submission">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>

            <feedback-config-panel ref="past_limit_config_panel"
                                   v-model="d_past_limit_submission_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.past_limit}}
                  <i class="fas fa-question-circle input-tooltip">
                    <tooltip width="large" placement="right">
                      {{FeedbackDescriptions.past_limit}}
                    </tooltip>
                  </i>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings
                  ref="past_limit_edit_feedback_settings"
                  v-model="d_past_limit_submission_fdbk_config"
                  :config_name="FeedbackConfigLabel.past_limit">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>

            <feedback-config-panel ref="student_lookup_config_panel"
                                   v-model="d_staff_viewer_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.staff_viewer}}
                  <i class="fas fa-question-circle input-tooltip">
                    <tooltip width="large" placement="right">
                      {{FeedbackDescriptions.staff_viewer}}
                    </tooltip>
                  </i>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings ref="student_lookup_edit_feedback_settings"
                                                 v-model="d_staff_viewer_fdbk_config"
                                                 :config_name="FeedbackConfigLabel.staff_viewer">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>
          </div>

          <div class="save-button-container-in-fieldset"
               v-if="d_editing_feedback_section">

            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                    class="save-button-active"
                    :disabled="!d_settings_form_is_valid || d_saving"
                    @click="save_ag_test_suite_settings(AGSuiteSettingsSection.feedback_settings)">Save</button>

            <button type="button"
                    class="cancel-button"
                    @click="reset_section(AGSuiteSettingsSection.feedback_settings)"> Cancel </button>
          </div>
        </fieldset>

      </validated-form>

      <!--------------------------- Danger Zone --------------------------------------->

      <modal v-if="d_show_delete_ag_test_suite_modal"
             @close="d_show_delete_ag_test_suite_modal = false"
             ref="delete_ag_test_suite_modal"
             size="large"
             click_outside_to_close>
        <div class="modal-header">
          Confirm Delete
        </div>
        <hr>
        <div class="modal-body">
          <p> Are you sure you want to delete the suite
            <span class="item-to-delete">{{d_ag_test_suite.name}}</span>?
            This will delete all associated test cases and run results.
            THIS ACTION CANNOT BE UNDONE. </p>
          <div class="deletion-modal-button-footer">
            <button class="modal-delete-button"
                    :disabled="d_deleting"
                    @click="delete_ag_test_suite()"> Delete </button>

            <button class="modal-cancel-button"
                    @click="d_show_delete_ag_test_suite_modal = false"> Cancel </button>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    ExpectedStudentFile,
    get_sandbox_docker_images,
    InstructorFile,
    Project,
    SandboxDockerImageData
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Dropdown from '@/components/dropdown.vue';
// import FormSection from '@/components/form_section.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import Modal from '@/components/modal.vue';
import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_suites/ag_test_suite_advanced_fdbk_settings.vue';
import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel.vue';
import { AGTestSuiteFeedbackPreset, FeedbackConfigLabel, FeedbackDescriptions } from '@/components/project_admin/feedback_config_utils';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { SafeMap } from '@/safe_map';
import { deep_copy, format_datetime, handle_api_errors_async, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

export enum AGSuiteSettingsSection {
    general = "General",
    grading_environment =  "Grading Environment",
    instructor_files = "Instructor Files",
    student_files = "Student Files",
    setup = "Setup",
    feedback_settings = "Feedback Settings"
}

@Component({
  components: {
     APIErrors,
     FeedbackConfigPanel,
     Dropdown,
     DropdownTypeahead,
     AGTestSuiteAdvancedFdbkSettings,
     Modal,
     Tab,
     TabHeader,
     Tabs,
     Toggle,
     Tooltip,
     ValidatedForm,
     ValidatedInput
  }
})
export default class AGSuiteSettings extends Vue {

  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  @Prop({required: true, type: Project})
  project!: Project;

  @Watch('ag_test_suite')
  on_test_suite_change(new_test_suite: AGTestSuite, old_test_suite: AGTestSuite) {
      this.d_ag_test_suite = deep_copy(new_test_suite, AGTestSuite);
  }

  d_ag_test_suite: AGTestSuite | null = null;
  d_docker_images: SandboxDockerImageData[] = [];
  d_loading = true;
  d_saving = false;
  d_settings_form_is_valid = true;
  d_deleting = false;
  d_show_delete_ag_test_suite_modal = false;

  d_name = "";
  d_deferred = false;

  d_sandbox_environment: SandboxDockerImageData | null = null;
  d_allow_network_access = false;

  d_instructor_files_needed: InstructorFile[] = [];

  d_student_files_needed: ExpectedStudentFile[] = [];

  d_setup_command_name = "";
  d_setup_command = "";

  d_normal_fdbk_config: null | AGTestSuiteFeedbackConfig = null;
  d_ultimate_submission_fdbk_config: null | AGTestSuiteFeedbackConfig = null;
  d_past_limit_submission_fdbk_config: null | AGTestSuiteFeedbackConfig = null;
  d_staff_viewer_fdbk_config: null | AGTestSuiteFeedbackConfig = null;

  d_editing_suite_name_section = false;
  d_editing_instructor_files_section = false;
  d_editing_student_files_section = false;
  d_editing_grading_environment = false;
  d_editing_setup_section = false;
  d_editing_feedback_section = false;

  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  readonly FeedbackDescriptions = FeedbackDescriptions;
  readonly AGSuiteSettingsSection = AGSuiteSettingsSection;
  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  async created() {
    this.d_ag_test_suite = deep_copy(this.ag_test_suite, AGTestSuite);
    this.d_docker_images = await get_sandbox_docker_images();

    this.d_name = this.d_ag_test_suite.name;
    this.d_deferred = this.d_ag_test_suite.deferred;
    this.d_sandbox_environment = this.d_ag_test_suite.sandbox_docker_image;
    this.d_allow_network_access = this.d_ag_test_suite.allow_network_access;
    this.d_instructor_files_needed = JSON.parse(JSON.stringify(this.d_ag_test_suite!.instructor_files_needed));
    this.d_student_files_needed = JSON.parse(JSON.stringify(this.d_ag_test_suite!.student_files_needed));
    this.d_setup_command = this.d_ag_test_suite.setup_suite_cmd;
    this.d_setup_command_name = this.d_ag_test_suite.setup_suite_cmd_name;
    this.d_normal_fdbk_config = this.d_ag_test_suite.normal_fdbk_config;
    this.d_ultimate_submission_fdbk_config = this.d_ag_test_suite.ultimate_submission_fdbk_config;
    this.d_past_limit_submission_fdbk_config = this.d_ag_test_suite.past_limit_submission_fdbk_config;
    this.d_staff_viewer_fdbk_config = this.d_ag_test_suite.staff_viewer_fdbk_config;
    this.d_loading = false;
  }

  get instructor_files_available() {
    return this.project.instructor_files!.filter((instructor_file: InstructorFile) => {
      return this.d_instructor_files_needed.findIndex(
            (file: InstructorFile) => file.pk === instructor_file.pk) === -1;
    });
  }

  get expected_student_files_available() {
    return this.project.expected_student_files.filter(
        (expected_student_file: ExpectedStudentFile) => {
            return this.d_student_files_needed.findIndex(
                (file: ExpectedStudentFile) => file.pk === expected_student_file.pk) === -1;
        }
    );
  }

  add_instructor_file(instructor_file: InstructorFile) {
      this.d_editing_instructor_files_section = true;
      this.d_instructor_files_needed.push(instructor_file);
  }

  add_student_file(student_file: ExpectedStudentFile) {
    this.d_editing_student_files_section = true;
    this.d_student_files_needed.push(student_file);
  }

  delete_ag_test_suite() {
    return toggle(this, 'd_deleting', async () => {
      await this.d_ag_test_suite!.delete();
      this.d_show_delete_ag_test_suite_modal = false;
    });
  }

  instructor_file_filter_fn(file: InstructorFile, filter_text: string) {
    return file.name.indexOf(filter_text) >= 0;
  }

  expected_student_file_filter_fn(file: ExpectedStudentFile, filter_text: string) {
    return file.pattern.indexOf(filter_text) >= 0;
  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  async save_ag_test_suite_settings(section: AGSuiteSettingsSection) {
    try {
        this.d_saving = true;
        this.update_section(section);
        (<APIErrors> this.$refs.api_errors).clear();
        await this.d_ag_test_suite!.save();
        this.remove_save_button(section);
    }
    finally {
        this.d_saving = false;
    }
  }

  remove_save_button(section: AGSuiteSettingsSection) {
    console.log("Remove save button called with: " + section);
    if (section === AGSuiteSettingsSection.general) {
      this.d_editing_suite_name_section = false;
    }
    else if (section === AGSuiteSettingsSection.grading_environment) {
        console.log(this.d_editing_grading_environment);
        this.d_editing_grading_environment = false;
        console.log(this.d_editing_grading_environment);
    }
    else if (section === AGSuiteSettingsSection.instructor_files) {
        this.d_editing_instructor_files_section = false;
    }
    else if (section === AGSuiteSettingsSection.student_files) {
        this.d_editing_student_files_section = false;
    }
    else if (section === AGSuiteSettingsSection.setup) {
        this.d_editing_setup_section = false;
    }
    // Feedback Settings
    else {
        this.d_editing_feedback_section = false;
    }
  }

  update_section(section: AGSuiteSettingsSection) {
    if (section === AGSuiteSettingsSection.general) {
        this.d_ag_test_suite!.name = this.d_name;
        this.d_ag_test_suite!.deferred = this.d_deferred;
    }
    else if (section === AGSuiteSettingsSection.grading_environment) {
        this.d_ag_test_suite!.sandbox_docker_image = this.d_sandbox_environment!;
        this.d_ag_test_suite!.allow_network_access = this.d_allow_network_access;
    }
    else if (section === AGSuiteSettingsSection.instructor_files) {
        this.d_ag_test_suite!.instructor_files_needed = this.d_instructor_files_needed;
    }
    else if (section === AGSuiteSettingsSection.student_files) {
        this.d_ag_test_suite!.student_files_needed = this.d_student_files_needed;
    }
    else if (section === AGSuiteSettingsSection.setup) {
        this.d_ag_test_suite!.setup_suite_cmd_name = this.d_setup_command_name;
        this.d_ag_test_suite!.setup_suite_cmd = this.d_setup_command;
    }
    // Feedback Settings
    else {
        this.d_ag_test_suite!.normal_fdbk_config = this.d_normal_fdbk_config!;
        this.d_ag_test_suite!.ultimate_submission_fdbk_config = this.d_ultimate_submission_fdbk_config!;
        this.d_ag_test_suite!.past_limit_submission_fdbk_config = this.d_past_limit_submission_fdbk_config!;
        this.d_ag_test_suite!.staff_viewer_fdbk_config = this.d_staff_viewer_fdbk_config!;
    }
  }

  reset_section(section: AGSuiteSettingsSection) {
    if (section === AGSuiteSettingsSection.general) {
      this.d_name = this.d_ag_test_suite!.name;
      this.d_deferred = this.d_ag_test_suite!.deferred;
      this.d_editing_suite_name_section = false;
    }
    else if (section === AGSuiteSettingsSection.grading_environment) {
      this.d_sandbox_environment = this.d_ag_test_suite!.sandbox_docker_image;
      this.d_allow_network_access = this.d_ag_test_suite!.allow_network_access;
      this.d_editing_grading_environment = false;
    }
    else if (section === AGSuiteSettingsSection.instructor_files) {
      this.d_instructor_files_needed = JSON.parse(JSON.stringify(this.d_ag_test_suite!.instructor_files_needed));
      this.d_editing_instructor_files_section = false;
    }
    else if (section === AGSuiteSettingsSection.student_files) {
      this.d_student_files_needed = JSON.parse(JSON.stringify(this.d_ag_test_suite!.student_files_needed));
      this.d_editing_student_files_section = false;
    }
    else if (section === AGSuiteSettingsSection.setup) {
      this.d_setup_command_name = this.d_ag_test_suite!.setup_suite_cmd_name;
      this.d_setup_command = this.d_ag_test_suite!.setup_suite_cmd;
      this.d_editing_setup_section = false;
    }
    // Feedback Settings
    else {
      this.d_normal_fdbk_config = this.d_ag_test_suite!.normal_fdbk_config;
      this.d_ultimate_submission_fdbk_config = this.d_ag_test_suite!.ultimate_submission_fdbk_config;
      this.d_past_limit_submission_fdbk_config = this.d_ag_test_suite!.past_limit_submission_fdbk_config;
      this.d_staff_viewer_fdbk_config = this.d_ag_test_suite!.staff_viewer_fdbk_config;
      this.d_editing_feedback_section = false;
    }
  }

  readonly fdbk_presets = new SafeMap<string, AGTestSuiteFeedbackPreset>([
    [
      'Public Setup',
      {
        show_individual_tests: true,
        show_setup_return_code: true,
        show_setup_timed_out: true,
        show_setup_stdout: true,
        show_setup_stderr: true
      }
    ],
    [
      'Pass/Fail Setup',
      {
        show_individual_tests: true,
        show_setup_return_code: true,
        show_setup_timed_out: true,
        show_setup_stdout: false,
        show_setup_stderr: false
      }
    ],
    [
      'Private Setup',
      {
        show_individual_tests: true,
        show_setup_return_code: false,
        show_setup_timed_out: false,
        show_setup_stdout: false,
        show_setup_stderr: false
      }
    ]
  ]);
}

function handle_save_ag_suite_settings_error(component: AGSuiteSettings, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';

.tab-body {
  padding: 15px;
}

#setup-command-container {
  margin: 15px 0 10px 0;
}

.checkbox-container {
  padding: 0 12px 12px 12px;
}

.toggle-container {
  font-size: 14px;
  margin: 12px 5px 3px 3px;
  padding-bottom: 10px;
  min-width: 500px;
}

.instructor-files, .student-files {
  margin: 10px 0;
  border: 1px solid hsl(210, 20%, 90%);
  display: inline-block;
}

.file {
  padding: 5px 6px 5px 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  color: lighten(black, 40);
  padding-right: 30px;
}

.remove-file {
  color: hsl(220, 20%, 85%);
}

.remove-file-icon-container {
  display: inline-block;
  padding: 0 4px;
}

.remove-file-icon-container:hover {
  cursor: pointer;
  .remove-file {
    color: hsl(220, 20%, 55%);
  }
}

.odd-index {
  background-color: hsl(210, 20%, 96%);
}

#danger-zone-container {
  margin-top: 40px;

  .legend {
    color: black;
    font-size: 24px;
  }

  .delete-ag-test-suite-button {
    @extend .delete-level-button;
    margin-top: 10px;
  }

  .delete-ag-test-suite-button span {
    margin-left: 5px;
  }
}

.sandbox-container {
  padding: 10px 0 10px 3px;
}

.sandbox-docker-image-dropdown {
  min-width: 400px;
  width: 100%;
}

#ag-test-suite-name-container {
  padding: 10px 12px 22px 14px;
}

.save-button-container {
  padding: 5px 13px 16px 13px;
}

.save-button-container-in-fieldset {
  padding: 10px 0 15px 3px;
}

.save-button-active {
  @extend .green-button;
  margin-right: 10px;
}

.cancel-button {
  @extend .white-button;
  box-shadow: none;
  color: lighten(black, 30);
}

.file-icon {
  color: $navy-blue;
  padding-right: 5px;
}

</style>
