<template>
  <div class="filter-bar">

    <!-- 🔍 BÚSQUEDA -->
    <div v-if="config.search" class="filter-group search">
      <label>Búsqueda General</label>
      <div class="input-with-icon">
        <input
          v-model="localFilters.search"
          class="form-input"
          placeholder="Buscar..."
          @input="emitSearch"
        />
      </div>
    </div>

    <!-- 🧾 SELECTS -->
    <div
      v-for="select in config.selects || []"
      :key="select.key"
      class="filter-group"
    >
      <label>{{ select.label }}</label>

      <select
        v-model="localFilters[select.key]"
        class="form-select"
        @change="emitChange"
      >
        <option value="">{{ select.placeholder }}</option>

        <option
          v-for="opt in select.options"
          :key="opt[select.optionValue]"
          :value="opt[select.optionValue]"
        >
          {{ opt[select.optionLabel] }}
        </option>

      </select>
    </div>

    <!-- Chips -->
    <div v-if="config.chips">
      <div
        v-for="chipGroup in config.chips"
        :key="chipGroup.key"
        class="filter-chips-section"
        :class="{ disabled: isDisabled(chipGroup) }"
      >
        <label class="filter-label">
          {{ chipGroup.label }}
          <span v-if="isDisabled(chipGroup)" class="hint-text">
            Selecciona al menos un {{ chipGroup.dependsOn }}
          </span>
        </label>

        <div class="chips-group">
          <label
            v-for="(label, key) in chipGroup.options"
            :key="key"
            class="chip-checkbox"
            :class="{ disabled: isDisabled(chipGroup) }"
          >
            <input
              type="checkbox"
              :value="key"
              v-model="localFilters[chipGroup.key]"
              :disabled="isDisabled(chipGroup)"
              @change="onChange"
            />
            <span class="chip-text">{{ label }}</span>
          </label>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    modelValue: Object,
    config: Object
  },
  emits: ["update:modelValue", "search", "change"],

  data() {
    return {
      localFilters: { ...this.modelValue }
    }
  },

  watch: {
    localFilters: {
      deep: true,
      handler(val) {
        this.$emit("update:modelValue", val)
      }
    }
  },

  methods: {
    emitSearch() {
      this.$emit("search", this.localFilters)
    },
    emitChange() {
      this.$emit("change", this.localFilters)
    }
  }
}
</script>
