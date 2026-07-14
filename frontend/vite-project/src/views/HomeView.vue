<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Sparkles,
  Star
} from 'lucide-vue-next'

import FeaturesSection from '../components/FeaturesSection.vue'
import ReviewsSection from '../components/ReviewsSection.vue'
import BrandsSection from '../components/BrandsSection.vue'
import { API_BASE_URL } from '../config'

const router = useRouter()

const categories = ref<any[]>([])
const bestSelling = ref<any[]>([])
const featuredItems = ref<any[]>([])
const latestItems = ref<any[]>([])
const bestReviewed = ref<any[]>([])
const onSaleItems = ref<any[]>([])

const activeSlide = ref(0)
const slideDirection = ref<'next' | 'prev'>('next')

const slides = [
  {
    title: 'ESSENCE MASCARA LASH PRINCESS',
    subtitle: 'Beauty essentials',
    description:
      'Discover bold volume, dramatic length and an effortless finish designed for your everyday beauty routine.',
    price: '$9.99',
    tag: 'Trending now',
    link: '/shop?category=beauty',
    image:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp'
  },
  {
    title: 'CALVIN KLEIN CK ONE',
    subtitle: 'Signature fragrance',
    description:
      'A fresh and timeless unisex fragrance created for effortless everyday wear and unforgettable moments.',
    price: '$49.99',
    tag: 'Editor choice',
    link: '/shop?category=fragrances',
    image:
      'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp'
  },
  {
    title: 'ANNIBALE COLOMBO BED',
    subtitle: 'Modern living',
    description:
      'Elevate your bedroom with refined craftsmanship, premium materials and timeless contemporary design.',
    price: '$1,899.99',
    tag: 'Premium pick',
    link: '/shop?category=furniture',
    image:
      'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp'
  }
]

const nextSlide = () => {
  slideDirection.value = 'next'
  activeSlide.value = (activeSlide.value + 1) % slides.length
}

const prevSlide = () => {
  slideDirection.value = 'prev'
  activeSlide.value =
    (activeSlide.value - 1 + slides.length) % slides.length
}

const goToSlide = (index: number) => {
  slideDirection.value = index > activeSlide.value ? 'next' : 'prev'
  activeSlide.value = index
}

const openProduct = (id: string) => {
  router.push(`/products/${id}`)
}

let slideInterval: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  slideInterval = setInterval(nextSlide, 8000)

  try {
    const res = await fetch(`${API_BASE_URL}/api/home`)

    if (!res.ok) {
      throw new Error('Failed to fetch home data')
    }

    const data = await res.json()

    categories.value = data.categories || []
    bestSelling.value = data.bestSelling || []
    featuredItems.value = data.featuredItems || []
    latestItems.value = data.latestItems || []
    onSaleItems.value = data.onSaleItems || []
    bestReviewed.value = data.bestReviewed || []
  } catch (error) {
    console.error('Error fetching home data:', error)
  }
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<template>
  <main class="overflow-hidden bg-white text-gray-900">

    <!-- HERO -->
    <section class="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8">
      <div
        class="relative min-h-[620px] overflow-hidden rounded-[2.5rem] bg-[#f8f8fa] lg:min-h-[650px]"
      >
        <!-- Decoration -->
        <div
          class="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[100px]"
        ></div>

        <div
          class="absolute -bottom-52 left-20 h-[450px] w-[450px] rounded-full bg-pink-500/10 blur-[120px]"
        ></div>

        <div
          class="absolute left-[48%] top-16 hidden h-24 w-24 rounded-full border border-pink-500/20 lg:block"
        ></div>

        <Transition
          :name="slideDirection === 'next' ? 'slide-next' : 'slide-prev'"
        >
          <div
            :key="activeSlide"
            class="absolute inset-0 grid items-center gap-8 px-8 py-16 md:px-14 lg:grid-cols-2 lg:px-24"
          >
            <!-- Content -->
            <div class="relative z-10 max-w-xl">
              <div
                class="mb-7 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-white px-4 py-2 shadow-sm"
              >
                <Sparkles class="h-4 w-4 text-pink-500" />

                <span
                  class="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-700"
                >
                  {{ slides[activeSlide].tag }}
                </span>
              </div>

              <p
                class="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-pink-500"
              >
                {{ slides[activeSlide].subtitle }}
              </p>

              <h1
                class="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-7xl"
              >
                {{ slides[activeSlide].title }}
              </h1>

              <p
                class="mt-7 max-w-lg text-sm leading-7 text-gray-500 md:text-base"
              >
                {{ slides[activeSlide].description }}
              </p>

              <div class="mt-9 flex flex-wrap items-center gap-5">
                <button
                  @click="router.push(slides[activeSlide].link)"
                  class="group flex items-center gap-3 rounded-full bg-pink-500 px-7 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  Shop now

                  <ArrowRight
                    class="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </button>

                <div class="border-l border-gray-200 pl-5">
                  <span
                    class="block text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Starting from
                  </span>

                  <strong class="text-2xl font-black">
                    {{ slides[activeSlide].price }}
                  </strong>
                </div>
              </div>
            </div>

            <!-- Product Image -->
            <div
              class="relative hidden h-full items-center justify-center lg:flex"
            >
              <div
                class="absolute h-[440px] w-[440px] rounded-full bg-white shadow-[0_40px_100px_rgba(0,0,0,0.06)]"
              ></div>

              <div
                class="absolute h-[350px] w-[350px] rounded-full border border-dashed border-pink-500/30"
              ></div>

              <span
                class="absolute right-8 top-32 rounded-2xl bg-white px-5 py-4 shadow-xl"
              >
                <span class="block text-[10px] uppercase text-gray-400">
                  Special price
                </span>

                <strong class="text-lg text-pink-500">
                  {{ slides[activeSlide].price }}
                </strong>
              </span>

              <img
                :src="slides[activeSlide].image"
                :alt="slides[activeSlide].title"
                class="animate-float relative z-10 h-[430px] w-[430px] select-none object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </Transition>

        <!-- Hero Navigation -->
        <div
          class="absolute bottom-8 left-8 right-8 z-20 flex items-center justify-between md:left-14 md:right-14 lg:left-24 lg:right-24"
        >
          <div class="flex items-center gap-3">
            <button
              v-for="(_, index) in slides"
              :key="index"
              @click="goToSlide(index)"
              class="h-1.5 rounded-full transition-all duration-500"
              :class="
                activeSlide === index
                  ? 'w-12 bg-pink-500'
                  : 'w-3 bg-gray-300'
              "
            ></button>
          </div>

          <div class="flex gap-2">
            <button
              @click="prevSlide"
              class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:border-pink-500 hover:text-pink-500"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>

            <button
              @click="nextSlide"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-pink-500"
            >
              <ChevronRight class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <div class="py-16">
      <FeaturesSection />
    </div>

    <!-- BEST SELLING -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mb-10 flex items-end justify-between">
        <div>
          <span
            class="text-xs font-bold uppercase tracking-[0.3em] text-pink-500"
          >
            Customer favorites
          </span>

          <h2
            class="mt-3 text-3xl font-black tracking-tight md:text-4xl"
          >
            Best selling products.
          </h2>
        </div>

        <button
          @click="router.push('/shop')"
          class="hidden items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-pink-500 sm:flex"
        >
          View all
          <ArrowRight class="h-4 w-4" />
        </button>
      </div>

      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <article
          v-for="product in bestSelling"
          :key="product._id"
          @click="openProduct(product._id)"
          class="group cursor-pointer"
        >
          <div
            class="relative aspect-[4/4.5] overflow-hidden rounded-[2rem] bg-[#f8f8fa] p-7"
          >
            <span
              v-if="product.discountPercentage"
              class="absolute left-5 top-5 z-10 rounded-full bg-pink-500 px-3 py-1.5 text-[10px] font-bold text-white"
            >
              -{{ Math.round(product.discountPercentage) }}%
            </span>

            <button
              @click.stop
              class="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:text-pink-500"
            >
              <Heart class="h-4 w-4" />
            </button>

            <img
              :src="product.thumbnail || product.image || '/blog.png'"
              :alt="product.title || product.name"
              class="h-full w-full object-contain mix-blend-multiply transition duration-700 group-hover:scale-110"
            />

            <button
              class="absolute bottom-5 left-5 right-5 flex translate-y-5 items-center justify-center gap-2 rounded-full bg-gray-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:bg-pink-500"
            >
              <ShoppingBag class="h-4 w-4" />
              View product
            </button>
          </div>

          <div class="px-2 pt-5">
            <div class="mb-2 flex items-center gap-1">
              <Star
                class="h-3.5 w-3.5 fill-pink-500 text-pink-500"
              />

              <span class="text-xs font-medium text-gray-500">
                {{ product.rating || '4.8' }}
              </span>
            </div>

            <h3
              class="line-clamp-1 font-bold text-gray-800 transition group-hover:text-pink-500"
            >
              {{ product.title || product.name }}
            </h3>

            <span class="mt-2 block text-lg font-black text-gray-950">
              ${{ product.price }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- PROMO -->
    <section class="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-[2.5rem] bg-gray-950 text-white"
      >
        <div
          class="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-pink-500/30 blur-[130px]"
        ></div>

        <div class="grid min-h-[500px] lg:grid-cols-2">
          <div
            class="relative z-10 flex flex-col justify-center px-8 py-16 md:px-16 lg:px-20"
          >
            <span
              class="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-pink-500"
            >
              Limited time offer
            </span>

            <h2
              class="max-w-lg text-4xl font-black leading-tight tracking-tight md:text-6xl"
            >
              30% OFF
              <span class="text-pink-500">APPLE</span>
              COLLECTION.
            </h2>

            <p class="mt-6 max-w-md leading-7 text-gray-400">
              Upgrade your everyday technology with premium Apple products at
              exclusive prices.
            </p>

            <div class="mt-9 flex gap-3">
              <div
                v-for="item in [
                  ['21', 'Days'],
                  ['22', 'Hrs'],
                  ['19', 'Min'],
                  ['30', 'Sec']
                ]"
                :key="item[1]"
                class="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
              >
                <strong class="text-2xl">{{ item[0] }}</strong>

                <span class="text-[9px] uppercase tracking-wider text-gray-400">
                  {{ item[1] }}
                </span>
              </div>
            </div>

            <button
              @click="router.push('/shop')"
              class="mt-10 flex w-fit items-center gap-3 rounded-full bg-pink-500 px-8 py-4 text-xs font-bold uppercase tracking-wider transition hover:-translate-y-1"
            >
              Shop collection
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>

          <div class="relative min-h-[400px]">
            <img
              src="/apple_promo.png"
              alt="Apple Collection"
              class="absolute inset-0 h-full w-full object-cover"
            />

            <div
              class="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/30 to-transparent lg:block"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUCT COLLECTIONS -->
    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div class="mb-12">
        <span
          class="text-xs font-bold uppercase tracking-[0.3em] text-pink-500"
        >
          Explore products
        </span>

        <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
          Curated for you.
        </h2>
      </div>

      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="collection in [
            { title: 'Featured', products: featuredItems },
            { title: 'Latest items', products: latestItems },
            { title: 'Best reviewed', products: bestReviewed },
            { title: 'On sale', products: onSaleItems }
          ]"
          :key="collection.title"
        >
          <div class="mb-7 flex items-center gap-4">
            <h3
              class="whitespace-nowrap text-sm font-black uppercase tracking-wider"
            >
              {{ collection.title }}
            </h3>

            <div class="h-px flex-1 bg-gray-200"></div>
          </div>

          <div class="space-y-3">
            <article
              v-for="product in collection.products"
              :key="product._id"
              @click="openProduct(product._id)"
              class="group flex cursor-pointer items-center gap-4 rounded-2xl p-3 transition hover:bg-[#f8f8fa]"
            >
              <div
                class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f8f8fa] p-2"
              >
                <img
                  :src="
                    product.thumbnail ||
                    product.image ||
                    '/blog.png'
                  "
                  :alt="product.title || product.name"
                  class="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110"
                />
              </div>

              <div class="min-w-0">
                <h4
                  class="line-clamp-2 text-sm font-bold text-gray-800 transition group-hover:text-pink-500"
                >
                  {{ product.title || product.name }}
                </h4>

                <div class="mt-2 flex items-center gap-2">
                  <span
                    v-if="product.originalPrice"
                    class="text-xs text-gray-400 line-through"
                  >
                    ${{ Number(product.originalPrice).toFixed(2) }}
                  </span>

                  <span class="text-sm font-black text-pink-500">
                    ${{ Number(product.price).toFixed(2) }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <ReviewsSection />

    <!-- CATEGORIES -->
    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div
        class="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span
            class="text-xs font-bold uppercase tracking-[0.3em] text-pink-500"
          >
            Shop your way
          </span>

          <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Browse categories.
          </h2>
        </div>

        <p class="max-w-sm text-sm leading-6 text-gray-500">
          Find exactly what you need from our carefully selected product
          categories.
        </p>
      </div>

      <div
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        <article
          v-for="category in categories"
          :key="category._id"
          @click="
            router.push({
              path: '/shop',
              query: { category: category.name }
            })
          "
          class="group cursor-pointer"
        >
          <div
            class="relative aspect-square overflow-hidden rounded-[2rem] bg-[#f8f8fa] p-6 transition duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-gray-200/60"
          >
            <span
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white opacity-0 transition group-hover:opacity-100"
            >
              <ArrowRight class="h-3.5 w-3.5 text-pink-500" />
            </span>

            <img
              :src="category.image || '/blog.png'"
              :alt="category.name"
              class="h-full w-full object-contain mix-blend-multiply transition duration-700 group-hover:scale-110"
            />
          </div>

          <h3
            class="mt-4 text-center text-sm font-bold text-gray-700 transition group-hover:text-pink-500"
          >
            {{ category.name }}
          </h3>
        </article>
      </div>
    </section>

    <!-- BRANDS -->
    <BrandsSection />
  </main>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(-18px) rotate(2deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.6s ease;
}

.slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-next-leave-to {
  transform: translateX(-50%);
  opacity: 0;
}

.slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-prev-leave-to {
  transform: translateX(50%);
  opacity: 0;
}
</style>