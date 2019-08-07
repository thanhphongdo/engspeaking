<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
    <audio controls>
      <source src="http://localhost:8081" type="audio/mpeg">
    Your browser does not support the audio element.
    </audio>
    <button @click="test">test</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src
const { ipcRenderer } = require('electron')

@Component({
    components: {
        HelloWorld
    },
    methods: {
        test() {
            console.log('test.......1111.....');
            ipcRenderer.send('test', 'ping');
        }
    }
})
export default class Home extends Vue {}
</script>
