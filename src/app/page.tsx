"use client"
import { Button } from "@/components/ui/button"
import { getDoc, addDoc, collection, onSnapshot, getDocs } from "firebase/firestore";
import { firestore } from "../../lib/config";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react"
import toast from 'react-hot-toast'
import { GoogleApiWrapper } from "google-maps-react";
import GoogleMap from "@/components/Map";

export default function Home() {

  const [loading, setLoading] = useState(false)
  const [dumsorData, setDumsorData] = useState<any>([])
  const [aggregateData, setAggregateData] = useState<any>([])

  const saveData = async (data: any) => {
    try {
      const dataRef = collection(firestore, "data")
      await addDoc(dataRef, {
        ...data,
      })
      toast.success("Happy dumsor!")
    } catch (e) {
      toast.success("Try again later!")
      console.log("Couldn't add data:", e)
    }
  }

  const [longlat, setLonglat] = useState<{ latitude: number, longitude: number } | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number, locality?: string, country?: string }>();
  useEffect(() => {
    if ('geolocation' in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLonglat({ latitude, longitude });
      })
    }
  }, []);


  const fetchApiData = async ({ latitude, longitude }: { latitude: number, longitude: number }) => {
    const resLocality = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality|neighborhood|sublocality&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
    const resCountry = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=country&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
    const data1 = await resLocality.json();
    const data2 = await resCountry.json();

    const locality = data1?.results[0].address_components[0].long_name;
    const country = data2?.results[0].address_components[0].long_name;

    setLocation({
      // @ts-expect-error 
      longitude: longlat?.longitude,
      // @ts-expect-error 
      latitude: longlat?.latitude,
      locality,
      country
    })


  };
  useEffect(() => {
    if (longlat) {
      fetchApiData({
        latitude: longlat?.latitude,
        longitude: longlat.longitude
      })
    }
  }, [longlat])

  useEffect(() => {
    const dataRef = collection(firestore, "data");

    const snap = onSnapshot(dataRef, (snapshot) => {
      const snapData: any[] = []
      snapshot.forEach((doc) => {
        snapData.push(doc.data());
      })
      setDumsorData(snapData.filter((point: any) => Date.now() - point.timestamp <= 60 * 60 * 1000))
    })

    return () => {
      snap()
    }
  }, [])

  useEffect(() => {
    // Use reduce to aggregate the data based on locality
    // Filter data points that are within the past hour



    const aggregatedData = dumsorData.reduce((acc: any, curr: any) => {
      const locality = curr.locality;
      if (acc[locality]) {
        acc[locality].count++;
      } else {
        acc[locality] = { locality: locality, count: 1 };
      }
      return acc;
    }, {});

    // Convert the aggregatedData object to an array
    const result = Object.values(aggregatedData);
    setAggregateData(result);


    let tweet = "Dumsor update 🔦\n";
    let link = "\nAdd yours 👉🏾 http://dumsor.vercel.app\n";
    let hashtags = "\n\n#DumsorMustStop #DumsorTimetableNow"

    let locations = "";

    if (result.length > 0) {
      result.map((data: any, index: number) => {
        locations = locations + `${data.locality}: ${data.count}\n`;
      });
    } else {
      link = "\nNo data to show. If you don't have light, go and report before your phone goes off 👉🏽 dumsor.vercel.app";
    }

    tweet = tweet + locations + link + hashtags;

    console.log(tweet)

  }, [dumsorData])



  return (
    <main className="flex h-screen w-full flex-col-reverse md:flex-row bg-white items-center justify-between gap-4 ">
      <div className="w-full md:w-1/3 md:h-full h-2/5 flex flex-col justify-start gap-2 md:justify-between px-4 py-2 p-6">
        <h1 className="text-2xl font-semibold">Dumsor watch</h1>
        <div className="md:py-2 italic text-gray-500 text-sm">
          Showing data collected over the past hour
        </div>
        <div className="h-full overflow-auto hidden md:block ">
          {aggregateData.length > 0 ?
            <>
              {aggregateData.map((data: any, index: number) => {
                return <div key={index}>
                  <div className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 my-2">
                    <div className="font-semibold">
                      {data.locality}
                    </div>
                    <div className="text-gray-600">
                      {data.count} reports
                    </div>
                  </div>
                </div>
              })}
            </>
            :
            <>
              <div className="py-4">
                {`No data to show. If you don't have light, press the button below before your phone goes off 👇🏽`}
              </div>
            </>}
        </div>
        <div className="md:hidden">

          <div className="text-gray-600">
            {`${aggregateData.reduce((acc: any, curr: any) => curr.count + acc, 0)} reports: ${aggregateData.reduce((acc: any, curr: any) => curr.locality + ", " + acc, "")} ${aggregateData.length > 0 ? `latest at ${new Date(dumsorData.reduce((maxTimestamp: any, point: any) => {
              return Math.max(maxTimestamp, point.timestamp);
            }, 0)).toLocaleTimeString()} ` : ""}`}

          </div>
        </div>
        <Button disabled={loading || !longlat} className="w-full" onClick={async () => {
          try {
            setLoading(true)
            await saveData({
              ...location,
              timestamp: Date.now(),
            })
            setLoading(false)
          } catch (e) {
            setLoading(false)
          }
        }}>
          {longlat ?
            <>
              {loading ?
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
                :
                <>
                  Report dumsor at my location
                </>}
            </>
            :
            <>
            Location not available. Refresh
            </>
          }

        </Button>
      </div>
      <div className="w-full md:w-2/3 bg-gray-200 h-full">
        <GoogleMap lat={location?.latitude ? location?.latitude : 5.618533313268285} lng={location?.longitude ? location?.longitude : -0.17663492909490502}
          markers={dumsorData}
        />
      </div>
    </main>
  );
}
