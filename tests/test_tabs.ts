import Vue from 'vue';
import Component from 'vue-class-component';

import { config, mount, Wrapper } from '@vue/test-utils';

import * as sinon from 'sinon';

import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';

let original_match_media: (query: string) => MediaQueryList;

beforeEach(() => {
    config.logModifiedComponents = false;
    original_match_media = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
        value: jest.fn(() => {
            return { matches: true };
        })
    });
});

afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
        value: original_match_media
    });
    sinon.restore();
});

describe('Newly Added Tabs Test', () => {
    test('Possible to manually select newly added tab', () => {
        @Component({
            template:  `<tabs ref="tabs" v-model="current_tab">
                          <tab v-for="val in tab_vals" :key="val" ref="tab_1">
                            <tab-header>
                              Tab {{val}}
                            </tab-header>
                            <template slot="body">
                             Tab {{val}} body
                            </template>
                          </tab>
                        </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        })
        class WrapperComponent extends Vue {
            tab_vals = [1, 2, 3];
            current_tab = 0;

            add_tab() {
                this.tab_vals.push(4);
                this.current_tab = 3;
            }
        }

        let wrapper = mount(WrapperComponent);

        const tabs = wrapper.find({ref: 'tabs'});
        let tabs_component = <Tabs> tabs.vm;

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs_component.d_active_tab_index).toEqual(0);

        wrapper.vm.add_tab();

        expect(active_body.text()).toEqual('Tab 4 body');
        expect(tabs_component.d_active_tab_index).toEqual(3);

        wrapper.destroy();
    });
});

describe('Tabs tests', () => {
    let wrapper: Wrapper<Tabs>;

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Width Of Page Updates',  () => {
        const component = {
            template: `<tabs ref="tabs"></tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Tabs> wrapper.find({ref: 'tabs'}).vm;
        expect(tabs.d_page_width).toEqual(0);

        window.dispatchEvent(new Event('resize')); // this worked for the mountings
        expect(tabs.d_page_width).toEqual(1024);
    });

    test('Empty tabset', () => {
        const component = {
            template:  `<tabs ref="tabs"></tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});
        expect(tabs.isEmpty()).toEqual(true);
    });
    // --------------------------------------------------------------------------------------------

    test('Empty tab header and body', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header ref="tab_1">
    </tab-header>
    <template slot="body">
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };
        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});
        expect(tabs.exists()).toEqual(true);

        expect(tabs.find({ref: 'tab_1'}).isEmpty()).toEqual(true);
        expect(tabs.find({ref: 'active-tab-body'}).isEmpty()).toEqual(true);
    });

    // --------------------------------------------------------------------------------------------

    test('Tab header has bare text', () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="text_tab_header">
                      Spam
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.find({ref: 'text_tab_header'}).text()).toEqual('Spam');
    });

    // --------------------------------------------------------------------------------------------

    test('Tab header has html', () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="html_text_header">
                      <div>Spam</div>
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.find({ref: 'html_text_header'}).text()).toEqual('Spam');
    });

    // --------------------------------------------------------------------------------------------

    test('tab-header given string class', async () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="header" class="spam">
                      <div>Spam</div>
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        let header = tabs.find({ref: 'header'});
        expect(header.classes()).toContain('spam');
    });

    test('tab-header given object class info', async () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="header" :class="{spam: true}">
                      Header
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        let header = tabs.find({ref: 'header'});
        expect(header.classes()).toContain('spam');
    });

    test('tab-header given class array', async () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="header" :class="['spam']">
                      Header
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        let header = tabs.find({ref: 'header'});
        expect(header.classes()).toContain('spam');
    });

    test('tab-header has non-click event handler', async () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="header" @hover.native="hovered = true">
                      Header
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs,
                'tab-header': TabHeader
            },
            data: () => {
                return {
                    hovered: false
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(wrapper.vm.$data.hovered).toBe(false);

        let header = tabs.find({ref: 'header'});
        header.trigger('hover');

        expect(wrapper.vm.$data.hovered).toBe(true);
    });

    test('tab-header explicitly registered in parent', async () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="header">
                      Spam
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tab-header': TabHeader,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.find({ref: 'header'}).text()).toEqual('Spam');
    });

    test('tab-header not-explicitly registered in parent', async () => {
        const component = {
            template:  `
                <tabs ref="tabs">
                  <tab>
                    <tab-header ref="header">
                      Spam
                    </tab-header>
                    <template slot="body">
                      Body
                    </template>
                  </tab>
                </tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.find({ref: 'header'}).text()).toEqual('Spam');
    });

    // --------------------------------------------------------------------------------------------

    test('First tab selected by default', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header>
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_headers = tabs.findAll('.' + tabs.vm.tab_active_class);
        expect(active_headers.length).toBe(1);
        expect(active_headers.at(0).text()).toEqual('Tab 1');

        expect(tabs.findAll('.' + tabs.vm.tab_inactive_class).length).toBe(1);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Custom initial active tab', () => {
        const component = {
            template:  `<tabs ref="tabs" v-model="selected_tab">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header>
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    selected_tab: 1
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(1);

        let active_headers = tabs.findAll('.' + tabs.vm.tab_active_class);
        expect(active_headers.length).toBe(1);
        expect(active_headers.at(0).text()).toEqual('Tab 2');

        expect(tabs.findAll('.' + tabs.vm.tab_inactive_class).length).toBe(1);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Tab selected on click', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_2">
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_3">
        Tab 3
    </tab-header>
    <template slot="body">
        Tab 3 body
    </template>
    </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_2 = tabs.find({ref: 'tab_2'});
        tab_2.trigger('click');

        expect(tabs.vm.d_active_tab_index).toEqual(1);

        let active_headers = tabs.findAll('.' + tabs.vm.tab_active_class);
        expect(active_headers.length).toBe(1);
        expect(active_headers.at(0).text()).toEqual('Tab 2');

        expect(tabs.findAll('.' + tabs.vm.tab_inactive_class).length).toBe(2);

        expect(active_body.text()).toEqual('Tab 2 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Custom click handler on <tab>', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_2" @click.native="datum += 1">
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    datum: 0
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(wrapper.vm.$data.datum).toEqual(0);
        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_2 = tabs.find({ref: 'tab_2'});
        tab_2.trigger('click');

        expect(wrapper.vm.$data.datum).toEqual(1);
        expect(tabs.vm.d_active_tab_index).toEqual(1);

        expect(active_body.text()).toEqual('Tab 2 body');

        tab_2.trigger('click');
        expect(wrapper.vm.$data.datum).toEqual(2);
    });

    // --------------------------------------------------------------------------------------------

    test('Tab v-model binding', () => {
        const component = {
            template:  `<tabs ref="tabs" v-model="current_tab">
  <tab>
    <tab-header ref="tab_1">
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header>
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    current_tab: 0
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        // Set current_tab, active tab should change
        wrapper.setData({current_tab: 1});

        expect(tabs.vm.d_active_tab_index).toEqual(1);

        expect(active_body.text()).toEqual('Tab 2 body');

        // Click on inactive tab, current_tab should change
        let tab_1 = tabs.find({ref: 'tab_1'});
        tab_1.trigger('click');

        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs.vm.d_active_tab_index).toEqual(0);
        expect(wrapper.vm.$data.current_tab).toEqual(0);
    });

    // --------------------------------------------------------------------------------------------

    test('Active index off end selects last tab', () => {
        const component = {
            template:  `<tabs ref="tabs" v-model="current_tab">
  <tab>
    <tab-header ref="tab_1">
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_2">
      Tab 2
    </tab-header>
    <template slot="body">
     Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    current_tab: 2
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(1);
        expect(wrapper.vm.$data.current_tab).toEqual(1);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Closing selected first tab selects second', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab v-for="val in tab_vals" :key="val" ref="tab_1">
    <tab-header>
      Tab {{val}}
    </tab-header>
    <template slot="body">
     Tab {{val}} body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    tab_vals: [1, 2, 3]
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(0);
        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        wrapper.vm.$data.tab_vals.splice(0, 1);
        expect(tabs.vm.d_active_tab_index).toEqual(0);
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Closing selected middle tab selects right sibling', () => {
        const component = {
            template:  `<tabs ref="tabs" :value="1">
  <tab v-for="val in tab_vals" :key="val" ref="tab_1">
    <tab-header>
      Tab {{val}}
    </tab-header>
    <template slot="body">
     Tab {{val}} body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    tab_vals: [1, 2, 3]
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(1);
        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 2 body');

        wrapper.vm.$data.tab_vals.splice(1, 1);
        expect(tabs.vm.d_active_tab_index).toEqual(1);
        expect(active_body.text()).toEqual('Tab 3 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Closing selected last tab selects left sibling', () => {
        const component = {
            template:  `<tabs ref="tabs" :value="2">
  <tab v-for="val in tab_vals" :key="val" ref="tab_1">
    <tab-header>
      Tab {{val}}
    </tab-header>
    <template slot="body">
     Tab {{val}} body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    tab_vals: [1, 2, 3]
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(2);
        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 3 body');

        wrapper.vm.$data.tab_vals.splice(2, 1);
        expect(tabs.vm.d_active_tab_index).toEqual(1);
        expect(active_body.text()).toEqual('Tab 2 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Closing unselected tab does not change selected tab', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab v-for="val in tab_vals" :key="val" ref="tab_1">
    <tab-header>
      Tab {{val}}
    </tab-header>
    <template slot="body">
     Tab {{val}} body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    tab_vals: [1, 2, 3]
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs.vm.d_active_tab_index).toEqual(0);

        wrapper.vm.$data.tab_vals.splice(1, 1);

        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs.vm.d_active_tab_index).toEqual(0);
    });

    // --------------------------------------------------------------------------------------------

    test('Adding new tab does not change selected tab', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab v-for="val in tab_vals" :key="val" ref="tab_1">
    <tab-header>
      Tab {{val}}
    </tab-header>
    <template slot="body">
     Tab {{val}} body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            },
            data: () => {
                return {
                    tab_vals: [1, 2, 3]
                };
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs.vm.d_active_tab_index).toEqual(0);

        wrapper.vm.$data.tab_vals.push(4);

        expect(active_body.text()).toEqual('Tab 1 body');
        expect(tabs.vm.d_active_tab_index).toEqual(0);
    });

    // --------------------------------------------------------------------------------------------

    test('Non <tab> tag in <tabs> is discarded', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header ref="real_tab">
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>

  <div id="bad">BAD</div>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});
        expect(tabs.find({ref: 'real_tab'}).exists()).toEqual(true);
        expect(tabs.find('#bad').exists()).toEqual(false);
    });

    // --------------------------------------------------------------------------------------------

    test('String content in <tabs> is discarded', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <template slot="body">
      Tab 1 body
    </template>
  </tab>

  some extra text
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.text()).toContain('Tab 1');
        expect(tabs.text()).toContain('Tab 1 body');
        expect(tabs.text()).not.toContain('some extra text');
    });

    // --------------------------------------------------------------------------------------------

    test('Extra children in <tab> ignored', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header id="tab_header">
      Tab 1
    </tab-header>
    <template slot="body">
      Tab 1 body
    </template>

    <div id="extra"></div>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);

        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.find('#tab_header').exists()).toEqual(true);
        expect(tabs.text()).toContain('Tab 1');
        expect(tabs.find('#extra').exists()).toEqual(false);
    });

    // --------------------------------------------------------------------------------------------

    test('Error no children in <tab>', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Make sure <tab> elements have <tab-header> element and "body" slot');
    });

    // --------------------------------------------------------------------------------------------

    test('Error only 1 child in <tab>', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <template slot="body">
      Tab 1 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Make sure <tab> elements have <tab-header> element and "body" slot');
    });

    // --------------------------------------------------------------------------------------------

    test('Error missing header in <tab>, extra child present', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <div>extra</div>

    <template slot="body">
      Tab 1 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Missing "<tab-header>" tag in <tab>.');
    });

    // --------------------------------------------------------------------------------------------

    test('Error tab header not <template>', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <div slot="header">
      Tab 1
    </div>
    <template slot="body">
      Tab 1 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Missing "<tab-header>" tag in <tab>.');
    });

    // --------------------------------------------------------------------------------------------

    test('Error missing body in <tab>, extra child present', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <div>Extra</div>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Missing "body" slot in <tab>.');
    });

    // --------------------------------------------------------------------------------------------

    test('Error tab body not <template>', () => {
        sinon.stub(console, 'error');
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <div slot="body">
      Tab 1 body
    </div>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        expect(
            () => mount(component)
        ).toThrow('"body" slot must be a <template> tag.');
    });

    // --------------------------------------------------------------------------------------------

    test('Tab style changes based on whether a tab is active or not', () => {
        const component = {
            template:  `<tabs ref="tabs"
    tab_active_class="blue-theme-active"
    tab_inactive_class="blue-theme-inactive">
  <tab>
    <tab-header ref="tab_1">
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_2">
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);

        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.tab_active_class).toBe("blue-theme-active");

        expect(tabs.vm.tab_inactive_class).toBe("blue-theme-inactive");

        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_1 = tabs.find({ref: 'tab_1'});
        expect(tab_1.classes()).toContain("blue-theme-active");

        let tab_2 = tabs.find({ref: 'tab_2'});
        expect(tab_2.classes()).toContain("blue-theme-inactive");

        tab_2.trigger('click');
        expect(tab_2.classes()).toContain("blue-theme-active");
        expect(tab_1.classes()).toContain("blue-theme-inactive");

        expect(tabs.vm.d_active_tab_index).toEqual(1);

        expect(active_body.text()).toEqual('Tab 2 body');
    });

    // --------------------------------------------------------------------------------------------

    test('Tab style resorts to default settings if no inputs are supplied', () => {
        const component = {
            template:  `<tabs ref="tabs">
  <tab>
    <tab-header ref="tab_1">
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_2">
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
            components: {
                'tab': Tab,
                'tabs': Tabs
            }
        };

        wrapper = mount(component);

        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.tab_active_class).toBe("white-theme-active");

        expect(tabs.vm.tab_inactive_class).toBe("white-theme-inactive");

        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_1 = tabs.find({ref: 'tab_1'});
        expect(tab_1.classes()).toContain("white-theme-active");

        let tab_2 = tabs.find({ref: 'tab_2'});
        expect(tab_2.classes()).toContain("white-theme-inactive");

        tab_2.trigger('click');
        expect(tab_2.classes()).toContain("white-theme-active");
        expect(tab_1.classes()).toContain("white-theme-inactive");

        expect(tabs.vm.d_active_tab_index).toEqual(1);
        expect(active_body.text()).toEqual('Tab 2 body');
    });
});

describe('Sidebar tabs tests', () => {
    const component = {
        template:  `
<tabs ref="tabs" tab_position="side">
  <tab>
    <tab-header>
      Tab 1
    </tab-header>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <tab-header ref="tab_2">
      Tab 2
    </tab-header>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs>`,
        components: {
            'tab': Tab,
            'tabs': Tabs
        }
    };

    test('Select sidebar tabs with click', () => {
        let wrapper = mount(component);
        const tabs = <Wrapper<Tabs>> wrapper.find({ref: 'tabs'});

        expect(tabs.vm.d_active_tab_index).toEqual(0);

        let active_body = tabs.find({ref: 'active-tab-body'});
        expect(active_body.text()).toEqual('Tab 1 body');

        let tab_2 = tabs.find({ref: 'tab_2'});
        tab_2.trigger('click');

        expect(tabs.vm.d_active_tab_index).toEqual(1);

        let active_headers = tabs.findAll('.' + tabs.vm.tab_active_class);
        expect(active_headers.length).toBe(1);
        expect(active_headers.at(0).text()).toEqual('Tab 2');
        expect(active_body.text()).toEqual('Tab 2 body');

        expect(tabs.findAll('.' + tabs.vm.tab_inactive_class).length).toBe(1);
    });

    test('Sidebar tabs snapshot', () => {
        let wrapper = mount(component);
        expect(wrapper.vm.$el).toMatchSnapshot();
    });
});
