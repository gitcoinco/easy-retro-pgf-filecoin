import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/Button";
import { Markdown } from "~/components/ui/Markdown";
import { RoundProgress } from "~/features/info/components/RoundProgress";
import { Layout } from "~/layouts/DefaultLayout";

export default function LandingPage({}) {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Filecoin RetroPGF</h1>
          <Button icon={Plus} as={Link} href={"/applications/new"}>
            Apply with your project
          </Button>
        </div>
        <RoundProgress />
        <Image
          alt="Filecoin RetroPGF2"
          src={"/fil-rpgf-2.jpg"}
          width={1600}
          height={900}
        />

        {/* ROUND 1 LANDING PAGE CONTENTS */}
        {/* <Markdown>
          {`### Welcome to FIL-RetroPGF-1, the Filecoin network&apos;s first Optimism-inspired Retroactive Public Goods Funding round.
  It&apos;s a wrap! We&apos;d like to thank all the projects that participated in this round for their contributions and support in the process.

  This page presents an overview of the FIL allocation results for FIL-RetroPGF-1, for funds donated to the round by Titan Network, web3mine, Filecoin Foundation and Protocol Labs.


  Fig. 1 shows the allocation breakdown by project category.

  For additional breakdown and analysis of voting patterns, please check out this [article](https://medium.com/@blackbandres/a-deepdive-into-fil-retropgf-1-results-7e5a0bcdba08).

  Please refer to [this spreadsheet](https://docs.google.com/spreadsheets/d/15tQZU4yfzCCso_dd5NGXfSy6XB2pmrEZzZrG_TEIKyY/edit?usp=sharing) for an expanded version of the distribution table for all allocations.

  ### Total FIL allocated to each category

  <iframe src="https://plotly.com/~k2ncsu/1.embed?autosize=true" width="100%" height="800" />

  -

  ### What's Next?

  Distribution will start on June 20th 2024. We have reached out to recipients to conduct the KYC required for fund distribution. If you are a recipient, please make sure to respond by 13 June 2024 to be included in the first batch distribution. Distribution will be performed in batches on the 20th of each month. KYC must be completed by 13 August 2024 at the latest to avoid forfeiting funds.
  `}
        </Markdown> */}

        <Markdown>
          {`### Welcome to FIL-RetroPGF-2, an Optimism-inspired Retroactive Public Goods Funding round for the Filecoin Ecosystem.

  We're looking forward to seeing impactful projects in the ecosystem participate in this round and get rewarded for their contributions and support in the process.

  We are grateful for the funds donated to the round by Protocol Labs, Filecoin Foundation and Holon, allowing us to distribute 300K FIL to these impactful projects.

  **Round Documentation is available [here](https://www.notion.so/fil-retropgf/Round-2-Results-160d0d646da180b09e0ee8baa3c1dfb9?pvs=4).**

  Join our [telegram group](https://t.me/+U5XIROsTIdhhMTVl) to learn more about the round and to answer any queries you have!

  Join our [mailing list](https://forms.gle/RqZM7RtyNgtrVgEX6) to get updates on each Stage of the round!

  #### Results are out!

Votes have been tallied, issues have been resolved and the allocation results are out! Badgeholders have voted on 152 projects, 97 of which have been deemed eligible for funding. 

Check them out here: [https://tinyurl.com/fil-rpgf-2-results](https://tinyurl.com/fil-rpgf-2-results)

  #### What's Next?

  We have listed next steps for [distribution](https://fil-retropgf.notion.site/Round-2-Distribution-160d0d646da1808fa6dee96aa96715cb?pvs=4) in our notion documentation that you can check out here.
  `}
        </Markdown>
      </div>
    </Layout>
  );
}
