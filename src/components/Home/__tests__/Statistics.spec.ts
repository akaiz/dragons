import "jest";
import { Vue } from "vue-property-decorator";
import { mount } from "@vue/test-utils";
import Statistics from "../Statistics.vue";
import { Game } from "../../../interfaces/GameInterfaces";

describe("Listing.vue", () => {
  let wrapper: any = null;
  let gameData: Game;
  beforeEach(() => {
    gameData = {
      lives: 3,
      score: 100,
      gold: 100,
      gameId: "game123",
      highScore: 0,
      turn: 0,
      level: 0,
    };
    wrapper = mount(Statistics, {
      propsData: { gameData, gameId: gameData.gameId, lost: false },
    });
  });
  afterEach(() => {
    wrapper.destroy();
  });

  test("correct props are passed", () => {
    expect(wrapper.props()).toBeTruthy();
  });

  test("buttons rendered", () => {
    expect(wrapper.findAll("button").length).toBe(3);
  });

  test("game stats scores text is rendered", () => {
    const stats = wrapper.findAll("p");
    expect(stats.at(0).text()).toContain("100");
  });

  test("game stats lives text is rendered", () => {
    const stats = wrapper.findAll("p");
    expect(stats.at(1).text()).toContain("3");
  });

  test("game stats gold text is rendered", () => {
    const stats = wrapper.findAll("p");
    expect(stats.at(2).text()).toContain("100");
  });
});
