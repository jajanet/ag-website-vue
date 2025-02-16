import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGSuiteSetupResult from '@/components/project_view/submission_detail/ag_suite_setup_result.vue';

import * as data_ut from '@/tests/data_utils';

let submission: ag_cli.Submission;
let ag_test_suite_result: ag_cli.AGTestSuiteResultFeedback;
let group: ag_cli.Group;
let user: ag_cli.User;

let get_ag_test_suite_result_setup_stdout_stub: sinon.SinonStub;
let get_ag_test_suite_result_setup_stderr_stub: sinon.SinonStub;
let get_ag_test_suite_result_output_size_stub: sinon.SinonStub;

let setup_stdout_content: string;
let setup_stderr_content: string;

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(1);

    setup_stdout_content = "setup stdout content";
    setup_stderr_content = "setup stderr content";

    get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
    ).returns(
        Promise.resolve(setup_stdout_content)
    );

    get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
    ).returns(
        Promise.resolve(setup_stderr_content)
    );

    get_ag_test_suite_result_output_size_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_ag_test_suite_result_output_size'
    ).returns(Promise.resolve(
        {
            setup_stdout_size: 2,
            setup_stderr_size: 4
        }
    ));
});

afterEach(() => {
    sinon.restore();
});

describe('AGSuiteSetupResult tests', () => {
    let wrapper: Wrapper<AGSuiteSetupResult>;

    test('show_setup_stdout === false', async () => {
        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.find('#setup-stdout-section').exists()).toBe(false);
    });

    test('setup_stdout === null && show_setup_stdout === true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_ag_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                setup_stdout_size: null,
                setup_stderr_size: 2
            }
        ));

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 10; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_output_size!.setup_stdout_size).toBeNull();
        expect(wrapper.vm.d_setup_stdout_content).toEqual(null);
        expect(wrapper.find('#setup-stdout-section').text()).toContain("No output");
    });

    test('setup_stdout !== null and show_setup_stdout === true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stdout = true;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
        expect(get_ag_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_suite_result_setup_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_setup_stdout_content).toEqual(Promise.resolve(setup_stdout_content));
        expect(wrapper.find('#setup-stdout-section').text()).toContain(setup_stdout_content);
    });

    test('show_setup_stderr === false', async () => {
        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.find('#setup-stderr-section').exists()).toBe(false);
    });

    test('setup_stderr === null && show_setup_stderr === true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_ag_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                setup_stdout_size: 3,
                setup_stderr_size: null
            }
        ));

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_output_size!.setup_stderr_size).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toEqual(null);
        expect(wrapper.find('#setup-stderr-section').text()).toContain("No output");
    });

    test('setup_stderr !== null and show_setup_stderr === true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stderr = true;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(get_ag_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_suite_result_setup_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_setup_stderr_content).toEqual(Promise.resolve(setup_stderr_content));
        expect(wrapper.find('#setup-stderr-section').text()).toContain(setup_stderr_content);
    });
});

describe('AGSuiteSetupResult exit_status tests', () => {
    let wrapper: Wrapper<AGSuiteSetupResult>;

    test('setup_exit_status - setup_timed_out === null && setup_return_code === null', () => {
        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.find('#exit-status-section').exists()).toBe(false);
    });

    test('setup_exit_status - setup_timed_out === null && setup_return_code !== null',  () => {
        ag_test_suite_result!.setup_return_code = 1;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.ag_test_suite_result.setup_return_code).not.toBeNull();
        expect(wrapper.find('#exit-status-section').exists()).toBe(true);
        expect(wrapper.find('#exit-status-section').text()).toContain("1");
    });

    test('setup_exit_status - setup_timed_out === false && setup_return_code === null', () => {
        ag_test_suite_result!.setup_timed_out = false;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBe(false);
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.find('#exit-status-section').exists()).toBe(false);
    });

    test('setup_exit_status - setup_timed_out === true && setup_return_code === null',  () => {
        ag_test_suite_result!.setup_timed_out = true;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBe(true);
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.find('#exit-status-section').text()).toContain('(Timed out)');
    });
});

describe('AGSuiteSetupResult tests concerning Watchers', () => {
    let wrapper: Wrapper<AGSuiteSetupResult>;

    beforeEach(async () => {
        get_ag_test_suite_result_output_size_stub.onFirstCall().returns(
            Promise.resolve(
                {
                    setup_stdout_size: 0,
                    setup_stderr_size: 0
                }
            )
        );

        get_ag_test_suite_result_output_size_stub.onSecondCall().returns(
            Promise.resolve(
                {
                    setup_stdout_size: 1,
                    setup_stderr_size: 1
                }
            )
        );


        get_ag_test_suite_result_setup_stdout_stub.onFirstCall().returns(
            Promise.resolve(setup_stdout_content)
        );
        get_ag_test_suite_result_setup_stderr_stub.onFirstCall().returns(
            Promise.resolve(setup_stderr_content)
        );

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }
    });

    test('submission Watcher', async () => {
        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_ag_test_suite_result_output_size_stub.calledTwice).toBe(false);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
    });

    test('ag_test_suite_result Watcher', async () => {
        expect(wrapper.vm.ag_test_suite_result).toEqual(ag_test_suite_result);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();

        let updated_ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(1);
        wrapper.setProps({ag_test_suite_result: updated_ag_test_suite_result});
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(ag_test_suite_result).not.toEqual(updated_ag_test_suite_result);
        expect(wrapper.vm.ag_test_suite_result).toEqual(updated_ag_test_suite_result);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(1);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_setup_stdout_content).toEqual(Promise.resolve(setup_stdout_content));
        expect(wrapper.vm.d_setup_stderr_content).toEqual(Promise.resolve(setup_stderr_content));
    });

    test('fdbk_category Watcher', async () => {
        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.normal});
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.normal);
        expect(get_ag_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_ag_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
    });
});
