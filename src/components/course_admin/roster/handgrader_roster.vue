<template>
  <div class="handgrader-roster-container">
    <roster v-if="handgraders !== null"
            ref="handgrader_roster"
            role="handgraders"
            :roster="handgraders"
            @add_users="add_handgraders_to_roster($event)"
            @remove_user="remove_handgrader_from_roster($event)">
    </roster>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, User } from 'ag-client-typescript';

import Roster from '@/components/course_admin/roster/roster.vue';

@Component({
  components: {
    Roster
  }
})
export default class HandgraderRoster extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  d_course!: Course;
  handgraders: User[] = [];

  async created() {
    this.d_course = this.course;
    this.handgraders = await this.d_course.get_handgraders();
  }

  async add_handgraders_to_roster(new_handgraders: string[]) {
    await this.d_course.add_handgraders(new_handgraders);
    this.handgraders = await this.d_course.get_handgraders();
  }

  async remove_handgrader_from_roster(handgraders_to_delete: User[]) {
    await this.d_course.remove_handgraders(handgraders_to_delete);
  }
}
</script>

<style scoped lang="scss"> </style>
