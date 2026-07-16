"use client";
import EventCardSkeleton from "@/components/app/EventCardSkeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import EventCard from "@/components/app/EventCard";
import { useRequireOrganizer } from "@/hooks/useRequireOrganizer";

import {
  getOrganizerEvents,
  deleteEvent,
} from "@/lib/api";

import { CalendarDays } from "lucide-react";


export default function OrganizerEventsPage() {

  const router = useRouter();
  const authorizationLoading = useRequireOrganizer();

  const [events,setEvents] =
    useState<any[]>([]);

  const [loading,setLoading] =
    useState(true);



  useEffect(()=>{

    async function loadEvents(){

      if (authorizationLoading) {
        return;
      }

      const token =
        localStorage.getItem("token");


      if(!token){

        router.push("/login");
        return;

      }

      try{

        const data =
          await getOrganizerEvents(
            token
          );


        setEvents(
          Array.isArray(data)
            ? data
            : []
        );


      }catch(error){

        console.error(error);

        setEvents([]);

      }finally{

        setLoading(false);

      }

    }


    loadEvents();


  },[authorizationLoading, router]);





  async function handleDelete(
    id:number
  ){

    const token =
      localStorage.getItem("token");


    if(!token){
      router.push("/login");
      return;
    }


    try{


      await deleteEvent(
        token,
        id
      );


      setEvents(
        prev =>
          prev.filter(
            event =>
              event.id !== id
          )
      );


    }catch(error){

      console.error(error);

      alert(
        "Delete failed"
      );

    }

  }





 if (loading) {
  return (
    <main className="min-h-screen bg-[#FAF8F4] py-2">

      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-40 rounded-full bg-[#F5F2EA]" />

        <div className="mt-6 h-12 w-64 rounded-lg bg-[#E8E1D5]" />

        <div className="mt-3 h-5 w-80 max-w-full rounded bg-[#F5F2EA]" />
      </div>

      {/* Event Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>

    </main>
  );
}

return (

   <main className="min-h-screen bg-[#FAF8F4] py-2">


      {/* HEADER */}

      <div
  className="
    mb-8
    rounded-[28px]
    border
    border-[#E8E1D5]
    bg-white
    p-6
    shadow-sm
  "
>

  <div
    className="
      inline-flex
      items-center
      gap-2
      rounded-full
      border
      border-[#E8E1D5]
      bg-[#FAF8F4]
      px-4
      py-2
      text-sm
      font-medium
      text-[#0F4D3F]
    "
  >
    <CalendarDays className="h-4 w-4" />
    Organizer Panel
  </div>

  <h1
    className="
      mt-5
      font-serif
      text-[2.5rem]
      leading-none
      tracking-[-0.04em]
      text-[#183028]
      sm:text-[3.2rem]
    "
  >
    My Events
  </h1>

  <p
    className="
      mt-3
      max-w-lg
      text-[15px]
      leading-7
      text-[#6B746E]
    "
  >
    Manage, edit and monitor every event you've created from one place.
  </p>

</div>






      {events.length === 0 ? (


        <div className="
          rounded-3xl
          bg-white
          border border-[#E8E1D5]
          p-10
          text-center
        ">


          <h2 className="
            text-xl
            font-bold
            text-[#183028]
          ">
            No events created yet
          </h2>


          <p className="
            mt-2
            text-[#5E665F]
          ">
            Create your first event.
          </p>


        </div>



      ):(



        <div
  className="
    grid
    grid-cols-1
    gap-6
    md:grid-cols-2
    xl:grid-cols-3
  "
>



          {events.map(
            (event)=>(


            <EventCard

              key={event.id}

              event={event}

              role="organizer"

              canManage={true}

              isRegistered={false}

              onRegister={()=>{}}

              onDelete={handleDelete}

            />


          ))}



        </div>


      )}



    </main>

  );

}
