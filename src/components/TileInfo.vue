<template>
	<div class="">
		<h3 class="card-title"><span class="font-weight-bold">⬡</span> {{x}} / {{y}} {{status}}</h3>

    <b-button class="btn-xxs btn-primary" v-if="status != 'ScuttleCity'" v-b-modal.modal-1>Build a camp 🔥</b-button>

    <b-modal id="modal-1" title="Establish a new Camp">
      <p class="my-4">Build a 🔥</p>
    </b-modal>

    <p v-for="tag in active_tags">
      <span class="badge badge-secondary">
        {{ tag }}
      </span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'tile_info',
  props: [ 'x', 'y', 'active_tags' ],
  computed: {
    status() {
      if(this.scuttlecity())
      {
        return "ScuttleCity"
      }
      else
      {
        return "Unoccupied"  
      }
      
    }
  },
  methods: {
    scuttlecity(){
      if( (this.$route.params.x == 4 && this.$route.params.y == 21) || !(this.$route.params.x && this.$route.params.y) )
      {
        return true
      }
      else
      {
        return false
      }
    }
  }
}
</script>