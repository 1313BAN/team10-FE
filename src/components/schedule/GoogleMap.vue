<template>
    <div class="map-container">
      <div ref="mapRef" class="google-map"></div>
      
      <!-- 지도 컨트롤 -->
      <v-card class="map-controls" elevation="4">
        <v-btn
          icon
          size="small"
          @click="fitBounds"
          class="mb-2"
        >
          <v-icon>mdi-fit-to-page-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          @click="toggleRoute"
          :color="showRoute ? 'primary' : 'default'"
        >
          <v-icon>mdi-map-marker-path</v-icon>
        </v-btn>
      </v-card>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  
  const props = defineProps({
    places: {
      type: Array,
      required: true
    },
    selectedPlaceId: {
      type: String,
      default: null
    }
  })
  
  const emit = defineEmits(['marker-click'])
  
  // Refs
  const mapRef = ref(null)
  const map = ref(null)
  const markers = ref([])
  const polylines = ref([])
  const showRoute = ref(true)
  
  // 구글 맵 초기화
  const initMap = () => {
    // 구글 맵 인스턴스 생성
    map.value = new google.maps.Map(mapRef.value, {
      center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
      zoom: 12,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })
  
    // 마커 및 경로 생성
    createMarkers()
    if (showRoute.value) {
      createPolylines()
    }
    
    // 모든 마커가 보이도록 지도 조정
    fitBounds()
  }
  
  // 마커 생성
  const createMarkers = () => {
    // 기존 마커 제거
    markers.value.forEach(marker => marker.setMap(null))
    markers.value = []
  
    // 날짜별 색상
    const dayColors = ['#FF5252', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0']
  
    props.places.forEach((place, index) => {
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map.value,
        title: place.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: dayColors[(place.day - 1) % dayColors.length],
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      })
  
      // 정보 창
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0;">${place.name}</h3>
            <p style="margin: 0; color: #666;">Day ${place.day} - ${place.time}</p>
          </div>
        `
      })
  
      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        emit('marker-click', place.id)
        infoWindow.open(map.value, marker)
      })
  
      markers.value.push({ marker, placeId: place.id, infoWindow })
    })
  }
  
  // 경로 생성
  const createPolylines = () => {
    // 기존 경로 제거
    polylines.value.forEach(polyline => polyline.setMap(null))
    polylines.value = []
  
    // 날짜별로 그룹화
    const placesByDay = {}
    props.places.forEach(place => {
      if (!placesByDay[place.day]) {
        placesByDay[place.day] = []
      }
      placesByDay[place.day].push(place)
    })
  
    // 각 날짜별로 경로 생성
    Object.values(placesByDay).forEach((dayPlaces, index) => {
      const path = dayPlaces.map(place => ({ lat: place.lat, lng: place.lng }))
      
      const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: ['#FF5252', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'][index % 5],
        strokeOpacity: 0.8,
        strokeWeight: 3
      })
  
      polyline.setMap(map.value)
      polylines.value.push(polyline)
    })
  }
  
  // 모든 마커가 보이도록 지도 조정
  const fitBounds = () => {
    if (!map.value || props.places.length === 0) return
  
    const bounds = new google.maps.LatLngBounds()
    props.places.forEach(place => {
      bounds.extend({ lat: place.lat, lng: place.lng })
    })
    map.value.fitBounds(bounds)
  }
  
  // 경로 표시 토글
  const toggleRoute = () => {
    showRoute.value = !showRoute.value
    if (showRoute.value) {
      createPolylines()
    } else {
      polylines.value.forEach(polyline => polyline.setMap(null))
      polylines.value = []
    }
  }
  
  // 선택된 장소 하이라이트
  watch(() => props.selectedPlaceId, (newId) => {
    markers.value.forEach(({ marker, placeId, infoWindow }) => {
      if (placeId === newId) {
        marker.setAnimation(google.maps.Animation.BOUNCE)
        infoWindow.open(map.value, marker)
        setTimeout(() => {
          marker.setAnimation(null)
        }, 2000)
      } else {
        infoWindow.close()
      }
    })
  })
  
  // 장소 목록 변경 감지
  watch(() => props.places, () => {
    if (map.value) {
      createMarkers()
      if (showRoute.value) {
        createPolylines()
      }
      fitBounds()
    }
  }, { deep: true })
  
  onMounted(() => {
    // Google Maps API가 로드되었는지 확인
    if (typeof google !== 'undefined' && google.maps) {
      initMap()
    } else {
      // Google Maps API 로드 대기
      window.initGoogleMap = initMap
      
      // Google Maps API 스크립트 동적 로드
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initGoogleMap`
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error('Google Maps API 로드 실패')
      }
      document.head.appendChild(script)
    }
  })
  </script>
  
  <style scoped>
  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .google-map {
    width: 100%;
    height: 100%;
  }
  
  .map-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 8px;
    display: flex;
    flex-direction: column;
  }
  </style>