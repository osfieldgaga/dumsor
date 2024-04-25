"use client"
import { APIProvider, AdvancedMarker, Map, Marker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import Circle from './circle';


function GoogleMap({ lat, lng, markers }: { lat: number, lng: number, markers?: { lat: number, lng: number }[] }) {
    const position = { lat, lng };
    const map = useMap('main_map');

    const [zoom, setZoom] = useState(16)

    useEffect(() => {
        if (!map) return;

        console.log(map)
        // do something with the map instance
    }, [map]);
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : ""}>
            <Map id='main_map' onZoomChanged={(e) => {
                // console.log(`w-[${Math.ceil(128 * (zoom / 16)).toString()}px] h-[${Math.ceil(128 * (zoom / 16)).toString()}px]`)
                setZoom(e.detail.zoom)
            }} defaultCenter={position} defaultZoom={12} mapId={process.env.NEXT_PUBLIC_MAP_ID}>
                {markers?.map((marker: any) => {
                    return <>
                        {/* <Marker position={{
                            lat: marker.latitude,
                            lng: marker.longitude
                        }} /> */}
                        <Circle
                            radius={1500}
                            center={{
                                lat: marker.latitude,
                                lng: marker.longitude
                            }}

                            strokeColor={'#0c4cb3'}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={'#3b82f6'}
                            fillOpacity={0.3}
                        />
                        <AdvancedMarker

                            position={{
                                lat: marker.latitude,
                                lng: marker.longitude
                            }}>
                    
                            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'}>

                            </Pin>
                        </AdvancedMarker>
                    </>
                })}

            </Map>
        </APIProvider>
    );
}

export default GoogleMap;