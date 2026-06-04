"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useGameStore } from "@/lib/gameStore"

// Leaflet components dynamically imported with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false })

// GPS utility loaded client-side only
let _turfPoint: any = null, _turfDistance: any = null
if (typeof window !== "undefined") {
  import("@turf/turf").then(m => { _turfPoint = m.point; _turfDistance = m.distance })
}

function LocationMarker({ gamePoints }: { gamePoints: any[] }) {
  const [_position, _setPosition] = useState<[number, number] | null>(null)
  const _triggered = useRef<Set<string>>(new Set())
  const { teamId: _teamId } = useGameStore()
  const [_map, _setMap] = useState<any>(null)

  // useMapEvents loaded dynamically
  useEffect(() => {
    const _locWatcher: any = null
    import("react-leaflet").then(_mod => {
      // We need the map instance from MapContainer — use a child component inside MapContainer
    })
  }, [])

  return position ? (
    <>
      <Marker position={position} />
      {gamePoints.map((gp: any) => (
        <Circle
          key={gp.id}
          center={[gp.latitude, gp.longitude]}
          radius={gp.activation_radius_meters}
          pathOptions={{ color: "blue" }}
        />
      ))}
    </>
  ) : null
}

export default function MapPage() {
  const { gameId } = useGameStore()
  const [gamePoints, setGamePoints] = useState<any[]>([])

  useEffect(() => {
    if (!gameId) return
    supabase
      .from("game_points")
      .select("id, point_of_interest_id, order_index, latitude:points_of_interest(latitude), longitude:points_of_interest(longitude), activation_radius_meters:points_of_interest(activation_radius_meters), name:points_of_interest(name)")
      .eq("game_id", gameId)
      .then(({ data }) => {
        if (data) {
          const flat = data.map((r: any) => ({
            id: r.id,
            latitude: r.latitude,
            longitude: r.longitude,
            activation_radius_meters: r.activation_radius_meters,
            name: r.name,
          }))
          setGamePoints(flat)
        }
      })
  }, [gameId])

  return (
    <div className="h-screen w-screen relative">
      <MapContainer center={[43.1107, 12.3908]} zoom={16} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker gamePoints={gamePoints} />
      </MapContainer>
      <div className="absolute top-4 right-4 flex gap-2 z-[1000]">
        <Link href="/game/leaderboard" className="btn btn-sm btn-primary">Classifica</Link>
        <button className="btn btn-sm btn-secondary">Chat</button>
      </div>
    </div>
  )
}
