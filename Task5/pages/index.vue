<script setup>
import { ref, computed, watch } from 'vue'
import { useFetch } from '#app'
import { useDebounce } from '@vueuse/core'

const search = ref('')
const debouncedSearch = useDebounce(search, 300)

const currentPage = ref(1)
const itemsPerPage = 6

// Sorting states
const sortKey = ref('title')  // Default sorting by title
const sortOrder = ref('asc')   // Default sorting order is ascending

const { data, pending, error } = await useFetch('https://dummyjson.com/products?limit=100')
const products = computed(() => data.value?.products || [])

// Filtering products based on search input
const filtered = computed(() => {
  return products.value.filter(p =>
    p.title.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
    p.description.toLowerCase().includes(debouncedSearch.value.toLowerCase())
  )
})

// Sorting function: sorts products based on selected key and order
const sortedProducts = computed(() => {
  return filtered.value.sort((a, b) => {
    if (sortKey.value === 'price' || sortKey.value === 'rating') {
      const aValue = a[sortKey.value]
      const bValue = b[sortKey.value]
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    } else {
      const aValue = a[sortKey.value].toLowerCase()
      const bValue = b[sortKey.value].toLowerCase()
      return sortOrder.value === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
  })
})

// Paginated products after sorting
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(sortedProducts.value.length / itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Sort handler (change the sorting key and order)
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }

  // Reset page to 1 whenever sorting changes
  currentPage.value = 1
}

// Function to determine the sort icon direction
const sortIcon = (key) => {
  if (sortKey.value === key) {
    return sortOrder.value === 'asc' ? '↑' : '↓'
  }
  return ''
}

// Watch for changes to sorting and reset pagination
watch([sortKey, sortOrder], () => {
  currentPage.value = 1 // Reset to first page when sorting changes
})
</script>

<template>
  <div class="p-6 max-w-screen-xl mx-auto">
    <Head>
      <Title>Список продуктів</Title>
    </Head>

    <h1 class="text-2xl font-bold mb-4">Список продуктів</h1>

    <input
      v-model="search"
      placeholder="Пошук..."
      class="mb-4 p-2 border rounded w-full max-w-md"
    />

    <div v-if="pending" class="text-gray-600">Завантаження...</div>
    <div v-if="error" class="text-red-600">Помилка при завантаженні</div>

    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-300 divide-y divide-gray-200">
        <thead class="bg-gray-600">
          <tr>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('thumbnail')"
            >
              Фото
            </th>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('title')"
              :class="{'text-blue-500': sortKey === 'title'}"
            >
              Назва <span>{{ sortIcon('title') }}</span>
            </th>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('description')"
            >
              Опис <span>{{ sortIcon('description') }}</span>
            </th>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('price')"
            >
              Ціна <span>{{ sortIcon('price') }}</span>
            </th>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('rating')"
            >
              Оцінка <span>{{ sortIcon('rating') }}</span>
            </th>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('brand')"
            >
              Бренд <span>{{ sortIcon('brand') }}</span>
            </th>
            <th
              class="px-4 py-2 text-left cursor-pointer"
              @click="sortBy('category')"
            >
              Категорія <span>{{ sortIcon('category') }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td class="px-4 py-2">
              <img
                :src="product.thumbnail"
                alt="Фото"
                class="w-[100px] h-[100px] object-cover rounded"
              />
            </td>
            <td class="px-4 py-2 font-medium">{{ product.title }}</td>
            <td class="px-4 py-2 text-sm text-gray-600">{{ product.description }}</td>
            <td class="px-4 py-2">{{ product.price }}$</td>
            <td
              class="px-4 py-2 font-bold"
              :class="product.rating >= 4.5 ? 'text-green-600' : 'text-red-600'"
            >
              {{ product.rating }}
            </td>
            <td class="px-4 py-2">{{ product.brand }}</td>
            <td class="px-4 py-2">{{ product.category }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center mt-4">
      <button
        :disabled="currentPage === 1"
        @click="prevPage"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Попередня
      </button>

      <span>{{ currentPage }} з {{ totalPages }}</span>

      <button
        :disabled="currentPage === totalPages"
        @click="nextPage"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Наступна
      </button>
    </div>
  </div>
</template>
