import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import './Article.css';

function Privacy() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>プライバシーポリシー - ポストマッチ</title>
      </Helmet>

      <div className='bg'></div>
      <div className='article-container'>
        <h1 className='article-title'>プライバシーポリシー</h1>
        <section className='article-section'>
          <p>ポストマッチ運営者（以下「運営者」といいます。）は、ポストマッチ（以下「本サービス」といいます。）の運営において取り扱う利用者の個人情報について、個人情報保護法その他法令を遵守し、細心の注意を払って取り扱うために、以下のとおりプライバシーポリシーを定めます。</p>
        </section>
        <section className='article-section'>
          <h2>1. 運営者が取得する情報とその取得方法</h2>
          <p>本サービスにおいて運営者が取得する情報は次のとおりです。なお、本サービスのご利用内容・提供内容によっては取得しない情報もあります。</p>
          <h3>1-1. 利用者にご提供いただく情報</h3>
          <ul className='add-paragraphs'>
            <li>氏名、生年月日、性別、顔写真等</li>
            <li>連絡先（住所、電話番号およびメールアドレス等）</li>
            <li>決済情報（銀行口座情報、クレジットカード情報、および、電子マネー情報等）</li>
          </ul>
          <h3>1-2. 外部サービスからご提供いただく情報</h3>
          <p>利用者が本サービスをご利用されるにあたり、ソーシャルネットワークサービス等の外部サービスとの連携を許可した場合には、その許可の際にご同意いただいた内容に基づき、以下の情報を当該外部サービスから収集します。</p>
          <ul className='add-paragraphs'>
            <li>当該外部サービスで利用者が利用するID</li>
            <li>その他当該外部サービスのプライバシー設定により利用者が連携先に開示を認めた情報</li>
          </ul>
          <h3>1-3. その他</h3>
          <ul className='add-paragraphs'>
            <li>ご利用の端末情報、OS 情報、ブラウザ情報、接続情報、通信キャリア情報</li>
            <li>Cookie（クッキー）情報、ユーザーエージェント情報およびIPアドレス等のアクセスログ情報</li>
          </ul>
        </section>
        <section className='article-section'>
          <h2>2. 利用目的</h2>
          <p>運営者は、取得した利用者の情報を以下の目的のために利用します。</p>
          <ol className='ol-bracketed'>
            <li> 利用者の本人確認および認証のため</li>
            <li> 利用者からの問い合わせに対応するため</li>
            <li> 本サービスの利用料金の計算、決済、返金等のため</li>
            <li> 本サービスに関連する、新機能、更新情報、キャンペーン等の案内メールを送付するため</li>
            <li> 本サービスにおいて販売される商品、本サービスにおける抽選の景品・プレゼントなどの賞品等の発送等のため</li>
            <li> 不正行為または違法となる可能性のある行為を防止し、本サービスの円滑な運営と利用規約の施行のため</li>
            <li> システムメンテナンスやサービス不具合の対応のため</li>
            <li> 利用者を識別できない形式に加工した統計データを作成するため</li>
          </ol>
        </section>
        <section className='article-section'>
          <h2>3. 個人情報の第三者への提供</h2>
          <p>運営者は、以下の場合を除き、取得した個人情報を第三者に開示・提供・共有することはございません。</p>
          <ol className='ol-bracketed'>
            <li> 利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
            <li> 利用者本人の同意を得た場合</li>
            <li> 利用者を識別することができない状態で統計的なデータとして開示・提供するとき</li>
            <li> 法令に基づき公的機関または政府機関から開示を要求された場合</li>
          </ol>
        </section>
        <section className='article-section'>
          <h2>4. 個人情報の保護</h2>
          <p>運営者は、利用者の個人情報の紛失、盗用、悪用、不正アクセス、改ざんおよび破損を防ぐために、合理的範囲内で技術的および物理的措置を講じています。</p>
        </section>       
        <section className='article-section'>
          <h2>5. 個人情報の開示等の請求</h2>
          <p>運営者は、利用者から個人情報の開示、訂正、削除、利用停止等のご要望があった場合は、所定の手続でご本人確認を行ったうえで、法令に基づき対応いたします。ただし、その要請が不合理に繰り返されたものである場合、非現実的なものである場合、他者の権利を害するおそれのある場合、または関連する法令により別段要求されない場合は、お断りすることがあります。</p>
          <p>なお、当該ご要望につきましては、下記フォームからご連絡ください。</p>
          <p>ポストマッチ お問い合わせフォーム</p>
          <a href='https://docs.google.com/forms/d/e/1FAIpQLSej2cr85cbJ4jTywNygoe4xZVGB0gxVurhfOhme2CSQ4nqJIg/viewform' className='article-link' target='_blank' rel='noopener noreferrer'>https://docs.google.com/forms</a>
        </section>
        <section className='article-section'>
          <h2>6. 個人情報の修正・更新</h2>
          <p>利用者は、ご自身のマイページから個人情報を変更することができます。</p>
        </section>
        <section className='article-section'>
          <h2>7. 個人情報の破棄</h2>
          <p>運営者は、利用者から直接取得した情報について、利用者としての登録抹消や本サービスの終了など、合理的に不要だと判断される時点で破棄いたします。</p>
        </section>
        <section className='article-section'>
          <h2>8. Cookieの利用</h2>
          <p>運営者ウェブサイトでは、第三者が配信する広告を掲載しており、当該第三者のプライバシーポリシーに従って、運営者ウェブサイトを訪問した利用者のCookie情報が利用されることがあります。当該第三者によるCookie情報の広告配信への利用停止（オプトアウト）などについては、下記第三者のページをご参照ください。</p>
          <ol className='ol-bracketed'>
            <li>Google広告</li>
            <a href='https://support.google.com/ads/answer/2662922' className='article-link' target='_blank' rel='noopener noreferrer'>https://support.google.com/ads/answer/2662922</a>
            <li>Google Analytics</li>
            <a href='https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage?hl=ja' className='article-link' target='_blank' rel='noopener noreferrer'>https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage</a>
            <p>Google Inc.の提供する分析のためのクッキーです。本サービスの利便性を向上させることを目的として、本サービスの利用者数や利用者が本サービス内をどのように移動するかを把握・分析するためのデータ収集に使用します。利用者が閲覧したページに関するデータ（ページのURL等）を取得いたします。</p>
          </ol>
        </section>
        <section className='article-section'>
          <h2>9. プライバシーポリシーの改定</h2>
          <p>運営者は、事前の通知をすることなくプライバシーポリシーを随時変更することがあり、運営者のウェブサイトに掲載した時点から適用されるものとします。ただし、利用目的が大きく変更される場合は、改めて利用者から同意を得るものとします。</p>
        </section>
          <p>2023年8月1日 施行</p>
      </div>
    </>
  )
}

export default Privacy;