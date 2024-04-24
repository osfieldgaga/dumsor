"use client"
import { Button } from "@/components/ui/button"
import { getDoc, addDoc, collection } from "firebase/firestore";
import { firestore } from "../../lib/config";
import { useState } from "react";
import { Loader2 } from "lucide-react"

export default function Home() {

  const [loading, setLoading] = useState(false)

  const saveData = async (data: any) => {
    try {
      const dataRef = collection(firestore, "data")
      await addDoc(dataRef, {
        ...data,
      })
    } catch (e) {
      console.log("COuldn't add data:", e)
    }
  }

  return (
    <main className="flex h-screen w-full flex-row bg-white items-center justify-between gap-4 p-6">
      <div className="w-1/3 h-full flex flex-col justify-between">
        <h1 className="text-xl font-semibold">Cases</h1>
        <div className="h-full overflow-auto">
          <div className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 my-2">
            <div className="font-semibold">
              Area
            </div>
            <div className="text-gray-600">
              3 cases signaled
            </div>
          </div>
        </div>
        <Button disabled={loading} className="w-full" onClick={async () => {
          try {
            console.log("click")
            setLoading(true)
            await saveData({
              lon: 12345,
              lat: 5678,
              timestamp: Date.now(),
              town: "Prestea",
              area: "GCP"
            })
            setLoading(false)
          } catch (e) {
            setLoading(false)
          }
        }}>
          {loading ?
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </>
            :
            <>
              Record value
            </>}

        </Button>
      </div>
      <div className="w-2/3 bg-gray-200 h-full">

      </div>
    </main>
  );
}
