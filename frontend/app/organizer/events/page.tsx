"use client";

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





  if(loading){

    return (

      <div className="p-8">

        Loading your events...

      </div>

    );

  }





  return (

    <main className="min-h-screen bg-[#FAF8F4] p-8">


      {/* HEADER */}

      <div className="mb-8">


        <div className="
          inline-flex items-center gap-2
          rounded-full
          bg-white
          px-4 py-2
          text-[#0F4D3F]
          border border-[#E8E1D5]
        ">

          <CalendarDays className="h-4 w-4"/>

          Organizer Panel

        </div>



        <h1 className="
  mt-7
  font-serif
  text-[3.2rem]
  leading-[0.92]
  tracking-[-0.05em]
  text-[#183028]
">

  My Events

</h1>



        <p className="
          mt-2
          text-[#5E665F]
        ">

          Manage events created by you.

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



        <div className="
          grid gap-6
          md:grid-cols-2
          xl:grid-cols-3
        ">



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
