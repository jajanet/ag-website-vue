<template>
  <div id="edit-groups-component" v-if="!d_loading">
    <div class="edit-group-container">
      <div class="edit-limits">
        <div class="edit-title"> Edit Group </div>
        <group-lookup ref="group_lookup"
                      :groups="groups_by_members.data"
                      @update_group_selected="selected_group = $event"> </group-lookup>
        <edit-single-group v-if="selected_group !== null"
                           :course="course"
                           :project="project"
                           :group="selected_group">
        </edit-single-group>
        </div>
    </div>
    <div class="extensions-container">
      <table class="extensions-table">
        <tr>
          <th> Extensions </th>
          <th> </th>
        </tr>
        <tr v-for="(group, index) of groups_with_extensions"
            :class="index % 2 === 0 ? 'even-row' : 'odd-row'"
            v-if="group.extended_due_date !== null">
          <td class="group-members">
            <div v-for="(member_name, index) of group.member_names"
                 :class="{'space-out-members' : index !== group.member_names.length - 1}">
              {{member_name}}
            </div>
          </td>
        <td class="extension-date">
          {{format_datetime(group.extended_due_date)}}
        </td>
        </tr>
      </table>
      <div v-if="groups_with_extensions.length === 0">
        No extensions have been issued for this project.
      </div>
    </div>

    <modal v-if="d_show_create_group_modal"
           @close="d_show_create_group_modal = false"
           ref="create_group_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> Creating a New Group </div>
      <hr>
      <div class="modal-body">
        <create-single-group :course="course" :project="project"> </create-single-group>
      </div>
    </modal>

    <modal v-if="d_show_merge_groups_modal"
           @close="d_show_merge_groups_modal = false"
           ref="merge_groups_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header">Choose groups to merge:</div>
      <hr>
      <div class="modal-body">
        <merge-groups :project="project"
                      :groups="groups_by_members.data"
                      ref="merge_groups">
        </merge-groups>
      </div>
    </modal>

    <div class="button-footer">
      <button class="create-group-button"
              type="button"
              @click="d_show_create_group_modal = true"> Create New Group
      </button>

      <button class="merge-groups-button"
              type="button"
              :disabled="groups_by_pk.data.length < 2"
              @click="d_show_merge_groups_modal = true"> Merge Existing Groups
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, GroupObserver, Project } from 'ag-client-typescript';

import { ArraySet, HasMemberNames, HasPK, member_names_less, pk_less } from "@/array_set";
import GroupLookup from '@/components/group_lookup.vue';
import Modal from '@/components/modal.vue';
import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';
import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
import MergeGroups from '@/components/project_admin/edit_groups/merge_groups.vue';
import { deep_copy, format_datetime } from "@/utils";

@Component({
  components: {
    CreateSingleGroup,
    EditSingleGroup,
    GroupLookup,
    MergeGroups,
    Modal
  }
})
export default class EditGroups extends Vue implements GroupObserver {

  @Prop({required: true, type: Project})
  project!: Project;

  d_loading = true;

  course!: Course;

  groups_by_members = new ArraySet<Group, HasMemberNames>([], {less_func: member_names_less});
  groups_by_pk = new ArraySet<Group, HasPK>([], {less_func: pk_less});
  private d_groups_with_extensions = new ArraySet<Group, HasPK>([], {less_func: pk_less});
  selected_group: Group | null = null;
  d_show_create_group_modal = false;
  d_show_merge_groups_modal = false;

  readonly format_datetime = format_datetime;

  async created() {
    this.course = await Course.get_by_pk(this.project.course);

    let groups = await Group.get_all_from_project(this.project.pk);

    this.groups_by_members = new ArraySet<Group, HasMemberNames>(
      groups.slice(), {less_func: member_names_less});
    this.groups_by_pk = new ArraySet<Group, HasPK>(groups.slice(), {less_func: pk_less});

    this.d_groups_with_extensions = new ArraySet<Group, HasPK>(
      groups.filter(group => group.extended_due_date !== null),
      {less_func: pk_less}
    );
    this.d_loading = false;
  }

  mounted() {
    Group.subscribe(this);
  }

  beforeDestroy() {
    Group.unsubscribe(this);
  }

  get groups_with_extensions() {
    let groups = this.d_groups_with_extensions.data.slice();
    groups.sort((group_a: Group, group_b: Group) => {
      if (group_a.extended_due_date === group_b.extended_due_date) {
        return group_a.member_names[0].localeCompare(group_b.member_names[0]);
      }
      return group_a.extended_due_date!.localeCompare(group_b.extended_due_date!);

    });

    return groups;
  }

  update_group_created(group: Group): void {
    let copy = deep_copy(group, Group);
    this.groups_by_pk.insert(copy);
    this.groups_by_members.insert(copy);

    // Note: A newly created group won't have an extension.

    this.selected_group = copy;
    this.d_show_create_group_modal = false;
  }

  update_group_changed(group: Group): void {
    let original = this.groups_by_pk.get(group);
    this.groups_by_members.remove(original);
    this.groups_by_pk.remove(original);

    let copy = deep_copy(group, Group);
    this.groups_by_pk.insert(copy);
    this.groups_by_members.insert(copy);

    this.d_groups_with_extensions.remove(original, false);
    if (copy.extended_due_date !== null) {
      this.d_groups_with_extensions.insert(copy);
    }
  }

  update_group_merged(new_group: Group, group1_pk: number, group2_pk: number): void {
    let original1 = this.groups_by_pk.get({pk: group1_pk});
    let original2 = this.groups_by_pk.get({pk: group2_pk});

    this.groups_by_members.remove(original1);
    this.groups_by_members.remove(original2);

    this.groups_by_pk.remove(original1);
    this.groups_by_pk.remove(original2);

    this.d_groups_with_extensions.remove(original1, false);
    this.d_groups_with_extensions.remove(original2, false);

    let copy = deep_copy(new_group, Group);

    this.groups_by_pk.insert(copy);
    this.groups_by_members.insert(copy);
    if (copy.extended_due_date !== null) {
      this.d_groups_with_extensions.insert(copy);
    }
    this.d_show_merge_groups_modal = false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/edit_groups.scss';

#edit-groups-component {
  padding-bottom: 100px;
}

.edit-title {
  @extend .section-title;
  padding: 12px 0 12px 0;
}

#edit-groups-component {
  box-sizing: border-box;
}

.edit-group-container {
  box-sizing: border-box;
  min-width: 200px;
  padding: 10px 10px 50px 10px;
  vertical-align: top;
}

.extensions-container {
  box-sizing: border-box;
  padding: 10px 10px 64px 10px;
}

.extensions-table {
  text-align: left;
  border-collapse: collapse;
  font-size: 16px;
  width: 100%;
}

.even-row {
  background-color: hsl(210, 20%, 96%);
}

.odd-row {
  background-color: white;
}

th {
  @extend .section-title;
  padding: 12px 0;
}

.group-members {
  padding: 10px 20px 10px 10px;
  font-weight: 500;
  border-bottom: 1px solid hsl(210, 20%, 94%);
}

.space-out-members {
  padding-bottom: 5px;
}

.extension-date {
  border-bottom: 1px solid hsl(210, 20%, 94%);
  padding: 10px;
  text-align: right;
  vertical-align: top;
  width: 200px;
}

.extensions-container {
  width: 100%;
}

.button-footer {
  background-color: hsl(210, 20%, 96%);
  border-top: 1px solid hsl(210, 20%, 94%);
  bottom: 0;
  box-sizing: border-box;
  min-width: 370px;
  padding: 10px 10px 10px 10px;
  position: fixed;
  text-align: center;
  width: 100%;
}

.merge-groups-button {
  @extend .teal-button;
  margin-left: 15px;
}

.create-group-button {
  @extend .teal-button;
}

/**** Modal *******************************************************************/
.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.modal-body {
  min-width: 200px;
  padding: 10px 0 0 0;
}

@media only screen and (min-width: 481px) {
  .button-footer {
    text-align: right;
  }
}

@media only screen and (min-width: 881px) {
  .extensions-table {
    border-collapse: collapse;
    font-size: 16px;
  }

  .edit-group-container {
    display: inline-block;
    padding: 10px 5% 0 1.5%;
    width: 50%;
  }

  .extensions-container {
    display: inline-block;
    padding: 10px 1.5% 30px 1.5%;
    width: 50%;
  }
}

</style>
