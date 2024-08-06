<script lang="ts">
import Button from './atoms/Button.vue'
import LinkButton from './atoms/LinkButton.vue'
import CardList from './CardList.vue'

export default {}
</script>

<template>
  <div>
    <h1>Vue app</h1>
    <Button>
      increment
    </Button>
    <p>Text</p>
    <LinkButton>Go to top</LinkButton>
    <CardList />
  </div>
</template>
