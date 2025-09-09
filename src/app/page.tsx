'use client'

import React from 'react'
import Image from 'next/image'
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"
import "react-tabs/style/react-tabs.css"
import { HomeStats } from "@/app/components/home-stats"
import { ChatAnalytics } from "@/app/components/chat-analytics"
import { ClickAnalytics } from "@/app/components/click-analytics"
import { ChatContent } from "@/app/components/chat-content"

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Image
          src="/img/ibk_logo.png"
          alt="IBK 로고"
          width={150}
          height={150}
          className="object-contain"
        />
        {/* <h1 className="text-3xl font-bold text-[#0051A4] ml-auto">관리자 화면</h1> */}
      </div>
      <Tabs>
        <TabList>
          <Tab>🏠 홈</Tab>
          <Tab>📊 대화 활동 분석</Tab>
          <Tab>🎯 클릭 활동 분석</Tab>
          <Tab>📝 대화 내용 분석</Tab>
        </TabList>

        <TabPanel>
          <HomeStats />
        </TabPanel>
        <TabPanel>
          <ChatAnalytics />
        </TabPanel>
        <TabPanel>
          <ClickAnalytics />
        </TabPanel>
        <TabPanel>
          <ChatContent />
        </TabPanel>
      </Tabs>
    </div>
  )
}
