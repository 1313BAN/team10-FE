<template>
    <div class="attractions-step">
      <div class="text-h6 mb-4">필수 관광지 선택</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        여행 계획에 꼭 포함하고 싶은 관광지를 선택해주세요.
      </div>
  
      <!-- 검색 카드 -->
      <v-card variant="outlined" class="selection-card mb-6">
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
          <v-icon class="mr-2" color="primary">mdi-magnify</v-icon>
          관광지 검색
        </v-card-title>
        <v-card-text>
          <v-text-field
            ref="searchInput"
            v-model="searchQuery"
            label="관광지 이름이나 주소를 입력하세요"
            placeholder="예: 경복궁, 남산타워, 홍대..."
            prepend-inner-icon="mdi-map-search"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details="auto"
            @focus="initAutocomplete"
            @keydown.enter="performTextSearch"
          />
          
          <!-- 자동완성 결과 표시 -->
          <v-list 
            v-if="predictions.length > 0" 
            class="autocomplete-results mt-2"
            elevation="2"
          >
            <v-list-item
              v-for="prediction in predictions"
              :key="prediction.placePrediction.placeId"
              @click="selectPrediction(prediction)"
              class="autocomplete-item"
            >
              <template v-slot:prepend>
                <v-icon size="small">mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>{{ prediction.placePrediction.text.text }}</v-list-item-title>
              <v-list-item-subtitle>{{ prediction.placePrediction.secondaryText?.text || '' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
  
      <v-row>
        <!-- 검색 결과 -->
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="selection-card">
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              <v-icon class="mr-2" color="info">mdi-map-marker-multiple</v-icon>
              검색 결과
              <v-chip 
                v-if="searchResults.length > 0" 
                color="info" 
                size="small" 
                class="ml-2"
              >
                {{ searchResults.length }}개
              </v-chip>
            </v-card-title>
            <v-card-text style="max-height: 400px; overflow-y: auto;">
              <!-- 로딩 상태 -->
              <div v-if="isSearching" class="text-center pa-8">
                <v-progress-circular indeterminate color="primary" class="mb-2" />
                <div class="text-body-2 text-medium-emphasis">
                  관광지를 검색하고 있습니다...
                </div>
              </div>
              
              <!-- 검색 결과 리스트 -->
              <v-list v-else-if="searchResults.length > 0" density="comfortable">
                <v-list-item
                  v-for="place in searchResults"
                  :key="place.id"
                  class="attraction-item"
                  @click="selectPlace(place)"
                >
                  <template v-slot:prepend>
                    <v-avatar size="small" color="info" class="mr-3">
                      <v-icon size="16">mdi-map-marker</v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title>{{ place.displayName.text }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ place.formattedAddress }}
                  </v-list-item-subtitle>
                  
                  <!-- 평점 표시 -->
                  <template v-slot:append>
                    <div class="d-flex flex-column align-end">
                      <v-btn
                        icon="mdi-plus"
                        variant="text"
                        color="primary"
                        size="small"
                      />
                      <div v-if="place.rating" class="text-caption text-medium-emphasis mt-1">
                        <v-icon size="12" color="amber">mdi-star</v-icon>
                        {{ place.rating }}
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
              
              <!-- 검색 전/결과 없음 상태 -->
              <div v-else class="text-center pa-8">
                <v-icon color="grey" size="48" class="mb-2">
                  {{ hasSearched ? 'mdi-map-marker-off-outline' : 'mdi-map-search-outline' }}
                </v-icon>
                <div class="text-body-2 text-medium-emphasis">
                  {{ hasSearched ? '검색 결과가 없습니다' : '관광지를 검색해보세요' }}
                </div>
                <div v-if="!hasSearched" class="text-caption text-medium-emphasis mt-1">
                  장소명이나 주소를 입력하고 Enter를 누르세요
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- 선택된 관광지 -->
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="selection-card">
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              <v-icon class="mr-2" color="success">mdi-map-marker-check</v-icon>
              선택된 관광지
              <v-chip 
                v-if="selectedAttractions.length > 0" 
                color="success" 
                size="small" 
                class="ml-2"
              >
                {{ selectedAttractions.length }}개
              </v-chip>
            </v-card-title>
            <v-card-text style="max-height: 400px; overflow-y: auto;">
              <v-list v-if="selectedAttractions.length > 0" density="comfortable">
                <v-list-item
                  v-for="attraction in selectedAttractions"
                  :key="attraction.id"
                  class="attraction-item selected-item"
                >
                  <template v-slot:prepend>
                    <v-avatar size="small" color="success" class="mr-3">
                      <v-icon size="16">mdi-check</v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title>{{ attraction.displayName.text }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ attraction.formattedAddress }}
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <div v-if="attraction.rating" class="text-caption text-medium-emphasis mr-2">
                        <v-icon size="12" color="amber">mdi-star</v-icon>
                        {{ attraction.rating }}
                      </div>
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        size="small"
                        @click="removeAttraction(attraction)"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="text-center pa-8">
                <v-icon color="grey" size="48" class="mb-2">mdi-map-marker-plus-outline</v-icon>
                <div class="text-body-2 text-medium-emphasis">
                  선택된 관광지가 없습니다
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  왼쪽에서 관광지를 검색하여 추가해보세요
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 선택된 관광지 미리보기 -->
      <v-expand-transition>
        <v-card 
          v-if="selectedAttractions.length > 0" 
          variant="tonal" 
          color="success" 
          class="mt-6 selection-preview"
        >
          <v-card-text class="py-4">
            <div class="d-flex align-center">
              <v-icon color="success" class="mr-3">mdi-map-marker-check</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-medium">선택된 필수 관광지</div>
                <div class="text-h6 font-weight-bold mt-1">
                  {{ getSelectedAttractionsText() }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  총 {{ selectedAttractions.length }}개 관광지가 여행 계획에 포함됩니다
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
  
      <!-- API 오류 스낵바 -->
      <v-snackbar
        v-model="showErrorSnackbar"
        color="error"
        timeout="5000"
      >
        {{ errorMessage }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showErrorSnackbar = false">
            닫기
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  
  const props = defineProps({
    data: {
      type: Array,
      default: () => []
    }
  })
  
  const emit = defineEmits(['update'])
  
  // 반응형 상태
  const searchQuery = ref('')
  const searchResults = ref([])
  const selectedAttractions = ref(Array.isArray(props.data) ? [...props.data] : [])
  const isSearching = ref(false)
  const hasSearched = ref(false)
  const showErrorSnackbar = ref(false)
  const errorMessage = ref('')
  const predictions = ref([])
  const searchInput = ref(null)
  
  // Google Maps API 관련 변수
  let Place = null
  let AutocompleteSuggestion = null
  let searchTextModule = null
  
  // Google Maps API 초기화 (새로운 API)
  async function initGoogleMaps() {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded')
      return
    }
  
    try {
      // 새로운 Places API 모듈 가져오기
      const { Place: PlaceClass } = await google.maps.importLibrary('places')
      const { AutocompleteSuggestion: AutocompleteClass } = await google.maps.importLibrary('places')
      const { searchByText } = await google.maps.importLibrary('places')
      
      Place = PlaceClass
      AutocompleteSuggestion = AutocompleteClass
      searchTextModule = searchByText
      
      console.log('Google Maps Places API (New) initialized successfully')
    } catch (error) {
      console.error('Error initializing Google Maps:', error)
    }
  }
  
  // 자동완성 초기화
  function initAutocomplete() {
    if (!AutocompleteSuggestion) {
      initGoogleMaps()
    }
  }
  
  // 자동완성 검색 (새로운 API)
  async function getAutocomplete() {
    if (!searchQuery.value || !AutocompleteSuggestion) {
      predictions.value = []
      return
    }
  
    try {
      const request = {
        input: searchQuery.value,
        region: 'kr',
        language: 'ko',
        includedPrimaryTypes: ['tourist_attraction', 'museum', 'park', 'point_of_interest'],
        locationBias: {
          // 서울 중심으로 반경 50km
          circle: {
            center: { lat: 37.5665, lng: 126.9780 },
            radius: 50000
          }
        }
      }
  
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      predictions.value = suggestions || []
    } catch (error) {
      console.error('Autocomplete error:', error)
      predictions.value = []
    }
  }
  
  // 자동완성 선택
  async function selectPrediction(prediction) {
    searchQuery.value = prediction.placePrediction.text.text
    predictions.value = []
    
    // 장소 상세 정보 가져오기
    await getPlaceDetails(prediction.placePrediction.placeId)
  }
  
  // 장소 상세 정보 가져오기 (새로운 API)
  async function getPlaceDetails(placeId) {
    if (!Place) {
      console.error('Place class not initialized')
      return
    }
  
    isSearching.value = true
    hasSearched.value = true
  
    try {
      const place = new Place({
        id: placeId,
        requestedLanguage: 'ko'
      })
  
      await place.fetchFields({
        fields: ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'photos', 'types']
      })
  
      searchResults.value = [place]
    } catch (error) {
      console.error('Place details error:', error)
      errorMessage.value = '장소 정보를 가져오는데 실패했습니다.'
      showErrorSnackbar.value = true
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }
  
  // 텍스트 검색 (새로운 API)
  async function performTextSearch() {
    if (!searchQuery.value.trim() || !searchTextModule) return
  
    isSearching.value = true
    hasSearched.value = true
    predictions.value = []
  
    try {
      const request = {
        textQuery: searchQuery.value,
        languageCode: 'ko',
        region: 'kr',
        includedTypes: ['tourist_attraction', 'museum', 'park', 'point_of_interest'],
        maxResultCount: 10,
        locationBias: {
          circle: {
            center: { lat: 37.5665, lng: 126.9780 },
            radius: 50000
          }
        }
      }
  
      const { places } = await searchTextModule(request)
      
      if (places && places.length > 0) {
        // 각 장소의 추가 정보 가져오기
        const detailedPlaces = await Promise.all(
          places.map(async (place) => {
            await place.fetchFields({
              fields: ['displayName', 'formattedAddress', 'rating', 'photos']
            })
            return place
          })
        )
        searchResults.value = detailedPlaces
      } else {
        searchResults.value = []
      }
    } catch (error) {
      console.error('Search error:', error)
      errorMessage.value = '검색 중 오류가 발생했습니다.'
      showErrorSnackbar.value = true
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }
  
  // 장소 선택
  async function selectPlace(place) {
    console.log('Selecting place:', place.displayName?.text, place.id)
    
    // 이미 선택된 장소인지 확인
    if (selectedAttractions.value.find(a => a.id === place.id)) {
      console.log('Place already selected')
      return
    }
  
    // 선택 목록에 추가
    selectedAttractions.value.push({
      id: place.id,
      displayName: place.displayName,
      formattedAddress: place.formattedAddress,
      rating: place.rating,
      location: place.location,
      types: place.types,
      photos: place.photos
    })
  
    // 백엔드에 저장이 필요한 경우 여기에 API 호출 추가
    
    emit('update', selectedAttractions.value)
  }
  
  // 선택된 관광지 제거
  function removeAttraction(attraction) {
    console.log('Removing attraction:', attraction.displayName?.text)
    selectedAttractions.value = selectedAttractions.value.filter(
      a => a.id !== attraction.id
    )
    emit('update', selectedAttractions.value)
  }
  
  // 선택된 관광지들의 텍스트 반환
  const getSelectedAttractionsText = () => {
    if (selectedAttractions.value.length <= 3) {
      return selectedAttractions.value.map(attr => attr.displayName?.text || '').join(', ')
    } else {
      const first3 = selectedAttractions.value.slice(0, 3).map(attr => attr.displayName?.text || '').join(', ')
      return `${first3} 외 ${selectedAttractions.value.length - 3}곳`
    }
  }
  
  // 검색어 변경 감지
  let debounceTimer = null
  watch(searchQuery, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    
    if (!newVal) {
      predictions.value = []
      return
    }
    
    // 300ms 디바운스
    debounceTimer = setTimeout(() => {
      getAutocomplete()
    }, 300)
  })
  
  // props 변경 감시
  watch(() => props.data, (newData) => {
    if (Array.isArray(newData)) {
      selectedAttractions.value = [...newData]
    }
  }, { deep: true })
  
  // 외부 클릭 시 자동완성 닫기
  function handleClickOutside(event) {
    if (searchInput.value && !searchInput.value.$el.contains(event.target)) {
      predictions.value = []
    }
  }
  
  onMounted(() => {
    // Google Maps API 로드 확인
    if (window.google && window.google.maps) {
      initGoogleMaps()
    } else {
      // API가 아직 로드되지 않았다면 대기
      window.initGoogleMapsCallback = initGoogleMaps
    }
    
    // 외부 클릭 이벤트 리스너 추가
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    document.removeEventListener('click', handleClickOutside)
  })
  </script>
  
  <style scoped>
  .attractions-step {
    max-width: 100%;
  }
  
  .selection-card {
    height: 100%;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .selection-card:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }
  
  .attraction-item {
    transition: background-color 0.2s ease;
    cursor: pointer;
    border-radius: 8px;
    margin-bottom: 4px;
  }
  
  .attraction-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
  
  .selected-item {
    background-color: rgba(var(--v-theme-success), 0.05);
    border: 1px solid rgba(var(--v-theme-success), 0.2);
  }
  
  .selection-preview {
    border: 2px solid rgb(var(--v-theme-success));
    animation: fadeInUp 0.3s ease;
  }
  
  .autocomplete-results {
    position: absolute;
    z-index: 1000;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border-radius: 4px;
  }
  
  .autocomplete-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .autocomplete-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 커스텀 스크롤바 */
  :deep(.v-field--focused) {
    border-color: rgb(var(--v-theme-primary)) !important;
  }
  
  :deep(.v-chip) {
    font-weight: 500;
  }
  
  /* 리스트 아이템 스타일링 */
  :deep(.v-list-item__content) {
    padding: 8px 0;
  }
  
  :deep(.v-list-item-title) {
    font-weight: 500;
  }
  
  :deep(.v-list-item-subtitle) {
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.875rem;
  }
  </style>
  
  <!-- 
  사용 방법:
  
  1. Google Maps JavaScript API 로드 (index.html 또는 main layout에 추가):
  <script>
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "YOUR_API_KEY",
      v: "weekly",
      language: "ko",
      region: "KR"
    });
  </script>
  
  2. API 키 설정:
  - Google Cloud Console에서 프로젝트 생성
  - Places API (New) 활성화
  - Maps JavaScript API 활성화
  - API 키 생성 및 도메인 제한 설정
  
  3. 주요 변경사항:
  - AutocompleteService → AutocompleteSuggestion.fetchAutocompleteSuggestions()
  - PlacesService → Place 클래스와 searchByText 함수 사용
  - 비동기 모듈 로딩 (importLibrary)
  - Promise 기반 API
  
  4. 새로운 기능:
  - 더 정확한 타입 필터링 (includedPrimaryTypes)
  - 위치 편향 설정 (locationBias)
  - 언어 및 지역 설정 개선
  
  5. 백엔드 연동 (선택사항):
  - selectPlace 함수에서 백엔드 API 호출 추가
  - Place ID 대신 새로운 ID 형식 사용
  -->