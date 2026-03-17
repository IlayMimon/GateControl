import dayjs from 'dayjs';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HomePageBody from '../components/HomePageBody';
import { ToastContainer, toast } from 'react-toastify';
import LocationSelector from '../components/LocationSelector';
import BiLogo from '../assets/pictures/bi-logo.png';
import MashaanLogo from '../assets/pictures/mashaan-logo.png';
import TiksuvPdmLogo from '../assets/pictures/tikshuv-pdm-logo.png';
import { updateBranchByArmyIds } from '../functions/updateBranchByArmyIds';

const ARMY_IDS_TO_UPDATE = [
  '8360605',
  '8776083',
  '8482415',
  '8838733',
  '9221738',
  '9097706',
  '9271419',
  '9212980',
  '9186759',
  '9301130',
  '8899926',
  '9163069',
  '8788160',
  '8482400',
  '8313828',
  '8671549',
  '9236612',
  '8894351',
  '9140763',
  '8504020',
  '9106564',
  '8838699',
  '9295653',
  '9231758',
  '9235316',
  '9238062',
  '9265531',
  '9256103',
  '9045138',
  '9274545',
  '9081268',
  '8643092',
  '9289591',
  '5739645',
  '8363869',
  '9126445',
  '7031207',
  '7689731',
  '8372787',
  '9188055',
  '8415816',
  '7585312',
  '9298342',
  '9373140',
  '9042446',
  '9025225',
  '9070018',
  '8161687',
  '5116266',
  '9250137',
  '7235536',
  '9266363',
  '8356639',
  '9415117',
  '8557966',
  '9349341',
  '9348811',
  '9379961',
  '9496540',
  '9467588',
  '9631963',
  '9311030',
  '9695197',
  '9885772',
  '9828805',
  '9530806',
  '9811674',
  '9811762',
  '9848178',
  '9016042',
  '9565581',
  '9273543',
  '9355623',
  '9219373',
  '8889989',
  '9333124',
  '9848809',
  '9555973',
  '9459072',
  '9489290',
  '9187267',
  '9496983',
  '9718600',
  '9455883',
  '9792964',
  '9834220',
  '9616922',
  '9474482',
  '9558587',
  '9153314',
  '1256126',
  '9314169',
  '9152872',
  '9357374',
  '9330687',
  '9662334',
  '9620103',
  '9332957',
  '9310191',
  '9343680',
  '9597067',
  '9592929',
  '9335966',
  '9340485',
  '9350636',
  '8672517',
  '9259720',
  '9515694',
  '9458765',
  '9206095',
  '9106109',
  '9495124',
  '9647071',
  '9643052',
  '9650534',
  '7552504',
  '7574701',
  '7348311',
  '7038906',
  '7341081',
  '8025618',
  '5260558',
  '7281453',
  '6432229',
  '9326505',
  '9230652',
  '9402926',
  '9432172',
  '9434398',
  '9032814',
  '8882411',
  '8898389',
  '9219847',
  '9429689',
  '9253845',
  '9222380',
  '9485545',
  '9617356',
  '9453992',
  '8686973',
  '8876427',
  '9217817',
  '9411984',
  '7565360',
  '9497923',
  '8794852',
  '9228246',
  '9429565',
  '8376468',
  '8372515',
  '9212771',
  '9588511',
  '1278715',
  '8064696',
  '8025461',
  '9518392',
  '9496963',
  '9642157',
  '9521468',
  '9124582',
  '9251760',
  '9062074',
  '9435089',
  '9605854',
  '9357519',
  '9293427',
  '8703809',
  '9362154',
  '9566111',
  '1278246',
  '9366271',
  '9538410',
  '9592999',
  '9359170',
  '9426401',
  '9476765',
  '9186296',
  '9380675',
  '8727130',
  '9947027',
  '9053713',
  '9114603',
  '9670518',
  '9381787',
  '9361949',
  '9946130',
  '9523181',
  '9644204',
  '9331098',
  '9387742',
  '9247499',
  '9228320',
  '8698438',
  '9335023',
  '8781266',
  '9860998',
  '9837085',
  '9542303',
  '9722993',
  '9742400',
  '8878439',
  '9251331',
  '9346740',
  '9212185',
  '9374983',
  '9553480',
  '9371082',
  '9345801',
  '9449621',
  '9426855',
  '9427106',
  '9491571',
  '9347446',
  '9336069',
  '9632452',
  '9606557',
  '9618345',
  '9427445',
  '9518488',
  '9352952',
  '9294420',
  '9124620',
  '9274870',
  '9011505',
  '9575039',
  '1253486',
  '9515846',
  '9517886',
  '9361477',
  '8372276',
  '9330599',
  '8080112',
  '8841502',
  '8186272',
  '8534719',
  '8887411',
  '8698731',
  '8404466',
  '7415448',
  '8730725',
  '8701094',
  '9100198',
  '9929334',
  '9963930',
  '6053114',
  '8656397',
  '1254346',
  '9669628',
  '5127953',
  '214909665',
  '5237103',
  '8376106',
  '9558557',
  '9811149',
  '8660529',
  '8802352',
  '8379232',
  '9004962',
  '5736945',
  '5042446',
  '9712563',
  '8387389',
  '9219280',
  '5000403',
  '8819002',
  '8785000',
  '9153743',
  '7539741',
];

const TARGET_BRANCH_ID = 16;
// ─────────────────────────────────────────────────────────────────────────────

function HomePage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');
  const [updating, setUpdating] = useState(false);

  const handleUpdateBranch = async () => {
    setUpdating(true);
    const CHUNK_SIZE = 10;
    const START_CHUNK_INDEX = 0; // מתחיל מההתחלה
    const END_CHUNK_INDEX = 18; // עוצר לפני מערך 19 (אינדקס 18)
    const chunks: string[][] = [];
    for (let i = 0; i < ARMY_IDS_TO_UPDATE.length; i += CHUNK_SIZE) {
      chunks.push(ARMY_IDS_TO_UPDATE.slice(i, i + CHUNK_SIZE));
    }

    let totalSuccess = 0;
    let totalFailed = 0;
    const allFailedIds: string[] = [];

    try {
      for (let i = START_CHUNK_INDEX; i < Math.min(END_CHUNK_INDEX, chunks.length); i++) {
        console.log(
          `[updateBranch] מתחיל מערך ${i + 1}/${chunks.length}:`,
          chunks[i],
        );
        const { success, failed, failedIds } = await updateBranchByArmyIds(
          chunks[i],
          TARGET_BRANCH_ID,
        );
        totalSuccess += success;
        totalFailed += failed;
        allFailedIds.push(...failedIds);
        console.log(
          `[updateBranch] מערך ${i + 1}/${chunks.length} הסתיים ✓ | הצליחו: ${success}, נכשלו: ${failed}`,
        );
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (allFailedIds.length > 0) {
        console.warn('[updateBranch] מספרים אישיים שנכשלו:', allFailedIds);
        console.warn(
          '[updateBranch] כמערך להעתקה:',
          JSON.stringify(allFailedIds),
        );
      }

      if (totalFailed === 0) {
        toast.success(`עודכנו ${totalSuccess} רשומות בהצלחה`);
      } else {
        toast.warning(`עודכנו ${totalSuccess} רשומות, נכשלו ${totalFailed}`);
      }
    } catch (err) {
      console.error('[updateBranch] שגיאה:', err);
      if (allFailedIds.length > 0) {
        console.warn(
          '[updateBranch] מספרים שנכשלו עד כה:',
          JSON.stringify(allFailedIds),
        );
      }
      toast.error('שגיאה בעדכון המספרים האישיים');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="home-page">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
      <div className="home-page__header-logos">
        <img
          src={MashaanLogo}
          alt="לוגו מש״אן"
          className="home-page__header-logo"
        />
        <img
          src={TiksuvPdmLogo}
          alt="לוגו תקשוב פד״ם"
          className="home-page__header-logo"
        />
      </div>
      <div className="home-page__header">
        <h1>מעקב גישה למתקן {location && ` - ${location}`}</h1>
        <h2>{dayjs(new Date()).format('DD/MM/YYYY')}</h2>
      </div>
      <div className="home-page__body">
        {/* TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it */}
        {location ? (
          <HomePageBody />
        ) : (
          <div className="home-page__location-wrap">
            <LocationSelector titles={['פד"ם', 'מצודת האבות', 'באזל']} />
            <button
              className="home-page__update-branch-btn"
              onClick={handleUpdateBranch}
              disabled={updating}
            >
              {updating ? 'מעדכן...' : 'עדכון מספרים אישיים'}
            </button>
          </div>
        )}
      </div>
      <div className="home-page__credit">
        <img src={BiLogo} alt="BI Logo" className="home-page__credit-logo" />
        <span>פותח ע״י פלוגת BI DATA גדוד 373</span>
      </div>
    </div>
  );
}

export default HomePage;
