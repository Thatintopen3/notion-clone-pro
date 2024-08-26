import Image from "next/image";
import Link from "next/link";
import Banner from "../../../public/appBanner.png";
import Cal from "../../../public/cal.png";
import Logo from "../../../public/cypresslogo.svg";
import Diamond from "../../../public/icons/diamond.svg";
import CheckIcon from "../../../public/icons/check.svg";
import { CLIENTS, PRICING_CARDS, PRICING_PLANS, USERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { randomUUID } from "crypto";
import TitleSection from "@/components/landing-page/title-section";
import CustomCard from "@/components/landing-page/custom-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <section className="overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col gap-4 md:justify-center md:items-center">
        <TitleSection
          pill="✨ Your Workspace, Perfected"
          title="All-In-One Collaboration and Productivity Platform"
        />
        <div className="bg-white p-[2px] mt-6 rounded-xl bg-gradient-to-r from-primary to-brand-primaryBlue sm:w-[300px]">
          <Link
            href="/login"
            className="w-full rounded-[10px] p-3 text-2xl bg-background block text-center"
          >
            Get Cypress Free
          </Link>
        </div>
        <div className="md:mt-[-90px] sm:w-full w-[750px] flex justify-center items-center mt-[-40px] relative sm:ml-0 ml-[-50px]">
          <Image src={Banner} alt="Application Banner" />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>

      <section className="relative">
        <div className="overflow-hidden flex after:content[''] after:dark:from-brand-dark after:to-transparent after:from-background after:bg-gradient-to-l after:right-0 after:bottom-0 after:top-0 after:w-20 after:z-10 after:absolute before:content[''] before:dark:from-brand-dark before:to-transparent before:from-background before:bg-gradient-to-r before:left-0 before:top-0 before:bottom-0 before:w-20 before:z-10 before:absolute">
          {[...Array(2)].map((arr) => (
            <div key={arr} className="flex flex-nowrap animate-slide">
              {CLIENTS.map((client) => (
                <div key={client.alt} className="relative w-[200px] m-20 shrink-0 flex items-center">
                  <Image src={client.logo} alt={client.alt} width={200} className="object-contain max-w-none" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 flex justify-center items-center flex-col relative">
        <div className="w-[30%] blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/50 -z-10 top-22" />
        <TitleSection
          title="Keep track of your meetings all in one place"
          subheading="Capture your ideas, thoughts, and meeting notes in a structured and organized manner."
          pill="Features"
        />
        <div className="mt-10 max-w-[450px] flex justify-center items-center relative rounded-2xl border-8 border-washed-purple-300 border-opacity-10 sm:w-full">
          <Image src={Cal} alt="Banner" className="rounded-2xl" />
        </div>
      </section>

      <section className="relative">
        <div className="w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/50 -z-10 top-56" />
        <div className="mt-20 px-4 sm:px-6 flex flex-col overflow-x-hidden overflow-visible">
          <TitleSection
            title="Trusted by all"
            subheading="Join thousands of satisfied users who rely on our platform for their personal and professional productivity needs."
            pill="Testimonials"
          />
          {[...Array(2)].map((arr, index) => (
            <div
              key={randomUUID()}
              className={cn("mt-10 flex flex-nowrap gap-6 self-start", { "flex-row-reverse": index === 1, "animate-[slide_250s_linear_infinite]": true, "animate-[slide_250s_linear_infinite_reverse]": index === 1, "ml-[100vw]": index === 1 })}
              style={{ transform: index === 1 ? "translateX(-50%)" : undefined }}
            >
              {USERS.map((testimonial, i) => (
                <CustomCard
                  key={testimonial.name}
                  className="w-[500px] shrink-0 rounded-xl dark:bg-gradient-to-t dark:from-border dark:to-background"
                  cardHeader={
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`/avatars/${i + 1}.png`} />
                        <AvatarFallback>{testimonial.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-foreground">{testimonial.name}</CardTitle>
                        <CardDescription className="dark:text-washed-purple-800">{testimonial.name.toLowerCase()}</CardDescription>
                      </div>
                    </div>
                  }
                  cardContent={<p className="dark:text-washed-purple-800">{testimonial.message}</p>}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 px-4 sm:px-6">
        <TitleSection
          title="The Perfect Plan For You"
          subheading="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
          pill="Pricing"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          {PRICING_CARDS.map((card) => (
            <CustomCard
              key={card.planType}
              className={cn("w-[300px] rounded-2xl dark:bg-black/40 background-blur-3xl relative", { "border-brand-primaryPurple/70": card.planType === PRICING_PLANS.proplan })}
              cardHeader={
                <CardTitle className="text-2xl font-semibold">
                  {card.planType === PRICING_PLANS.proplan && (
                    <>
                      <div className="hidden dark:block w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/80 -z-10 top-0" />
                      <Image src={Diamond} alt="Pro Plan Icon" />
                    </>
                  )}
                  {card.planType}
                </CardTitle>
              }
              cardContent={
                <CardDescription className="dark:text-washed-purple-800">
                  {card.description}
                  <span className="font-normal text-sm text-foreground">${card.price}</span>
                  {+card.price > 0 ? (
                    <span className="dark:text-washed-purple-800 ml-1">/mo</span>
                  ) : (
                    <span className="dark:text-washed-purple-800 ml-1">Free Forever</span>
                  )}
                </CardDescription>
              }
              cardFooter={
                <ul className="font-normal flex mb-2 flex-col gap-4">
                  <small>{card.highlightFeature}</small>
                  {card.freatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Image src={CheckIcon} alt="Check Icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}
