"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import ListBlog from "@/app/components/layoutBlog/ListBlog";
import FilterSidebar from "@/app/components/layoutBlog/FilterSidebar";



export default function BlogPage() {

    return (

        <main>

            <div>
                <Navbar />
            </div>

            <div className="container mx-auto flex flex-col md:flex-row gap-10">
                <div>
                    <FilterSidebar />
                </div>

                <div>
                    <ListBlog />
                </div>

            </div>



            <div>
                <Footer />
            </div>


        </main>




    );
}
