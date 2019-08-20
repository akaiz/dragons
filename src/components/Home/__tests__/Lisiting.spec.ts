import 'jest';
import Vuetify from 'vuetify';
import { Vue } from 'vue-property-decorator';
import { shallowMount, mount } from '@vue/test-utils';
import Listing from '../Listing.vue';
import { GameAd } from '../../../interfaces/GameInterfaces';
Vue.use(Vuetify);

describe('Listing.vue', () => {
  let wrapper: any = null;
  const ads: GameAd[] = [];
  beforeEach(() => {

    for (let i = 1; i < 10; i++) {
      ads.push({
        adId: Math.random() + "",
        message: 'message' + i,
        reward: i,
        expiresIn: i,
        probability: i % 2 === 0 ? 'Piece of cake' : 'Walk in the park',
        startedTime: 1566264833,
        endTime: 1566264789,
        prediction: i % 2 === 0 ? "Positive" : "Negative",
      });
    }
    Vue.config.ignoredElements = [
      'vue-countdown-timer',
    ];
    wrapper = mount(Listing, {
      propsData: { messages: ads },
    });

  });
  afterEach(() => {
    wrapper.destroy();
  });

  test('correct props are passed', () => {

    expect(wrapper.props().messages.length).toBe(ads.length);
  });
  test('correct number of ads is rendered', () => {

    expect(wrapper.findAll('.message-item').length).toBe(ads.length);
  });
});
