<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import 'vue-toast-notification/dist/index.css';
import { positiveData, negativeData } from '../../util/training';
import { ShopItem} from '../../interfaces/GameInterfaces';
@Component
export default class Shop extends Vue {
  @Prop() public shopItems?: ShopItem[];
}
</script>
<template>
  <div class="container-fluid px-3 py-2">
    <h5>Shop Items</h5>
    <div class="py-10 shop-listing">
      <div
        class="px-4 py-0 shop-item"
        v-for="item in shopItems"
        v-bind:key="item.id"
        scrollable="true"
      >
        <p class="my-1"><b>Id:</b> {{ item.id }}</p>
        <p class="my-1"><b>Name:</b> {{ item.name }}</p>
        <p class="my-1"><b>Cost:</b> {{ item.cost }}</p>
        <button
          class="my-1 btn btn-secondary col-xs-12 col-md-2 py-0 px-2"
          v-on:click="$emit('shopItem', item)"
        >
          Buy
        </button>
      </div>
    </div>
  </div>
</template>
