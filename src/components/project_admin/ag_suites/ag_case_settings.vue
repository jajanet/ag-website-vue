<template>
  <div v-if="d_ag_test_case !== null">
    <div id="ag-test-case-settings-component">
      <validated-form ref="ag_test_case_settings_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="save_ag_test_case_settings"
                      @form_validity_changed="d_settings_form_is_valid = $event">

          <div id="name-container">
            <label class="text-label"> Test name </label>
            <validated-input ref="name"
                             v-model="d_ag_test_case.name"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>

          <div v-if="d_ag_test_case.ag_test_commands.length > 1"
               class="ag-case-feedback-panels">
            <AGTestCaseFdbkConfigPanel ref="normal"
                                       v-model="d_ag_test_case.normal_fdbk_config"
                                       :config_name="FeedbackConfigLabel.normal">
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
            </AGTestCaseFdbkConfigPanel>

            <AGTestCaseFdbkConfigPanel ref="final_graded"
                                       v-model="d_ag_test_case.ultimate_submission_fdbk_config"
                                       :config_name="FeedbackConfigLabel.ultimate_submission">
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
            </AGTestCaseFdbkConfigPanel>

            <AGTestCaseFdbkConfigPanel ref="past_limit"
                                       v-model="d_ag_test_case.past_limit_submission_fdbk_config"
                                       :config_name="FeedbackConfigLabel.past_limit">
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
            </AGTestCaseFdbkConfigPanel>

            <AGTestCaseFdbkConfigPanel ref="student_lookup"
                                       v-model="d_ag_test_case.staff_viewer_fdbk_config"
                                       :config_name="FeedbackConfigLabel.staff_viewer">
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
            </AGTestCaseFdbkConfigPanel>
          </div>

        <div id="button-footer">
          <APIErrors ref="api_errors"></APIErrors>

          <button id="save-button"
                  type="submit"
                  :disabled="!d_settings_form_is_valid || d_saving">
            Save
          </button>
        </div>
      </validated-form>
    </div>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { AGTestCase } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import AGTestCaseFdbkConfigPanel from '@/components/project_admin/ag_suites/ag_test_case_fdbk_config_panel.vue';
import { FeedbackConfigLabel, FeedbackDescriptions } from "@/components/project_admin/feedback_config_utils";
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    AGTestCaseFdbkConfigPanel,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGCaseSettings extends Vue {

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  readonly is_not_empty = is_not_empty;
  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  readonly FeedbackDescriptions = FeedbackDescriptions;

  d_ag_test_case: AGTestCase | null = null;
  d_saving = false;
  d_settings_form_is_valid = true;

  @Watch('ag_test_case')
  on_test_case_change(new_test_case: AGTestCase, old_test_case: AGTestCase) {
    this.d_ag_test_case = deep_copy(new_test_case, AGTestCase);
  }

  created() {
    this.d_ag_test_case = deep_copy(this.ag_test_case, AGTestCase);
  }

  @handle_api_errors_async(handle_save_ag_test_case_settings_error)
  async save_ag_test_case_settings() {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_ag_test_case!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}

function handle_save_ag_test_case_settings_error(component: AGCaseSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/components/feedback_config.scss';

#button-footer {
  margin: 12px 0 0 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

#save-button {
  @extend .green-button;
}

.ag-case-feedback-panels {
  padding-top: 15px;
}

</style>
