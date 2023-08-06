import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import './Article.css';

function Term() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>利用規約 - ポストマッチ</title>
      </Helmet>

      <div className='bg'></div>
      <div className='article-container'>
        <h1 className='article-title'>利用規約</h1>
        <section className='article-section'>
          <p>ポストマッチ（以下 「本サービス」といいます。）のご利用にあたり、このポストマッチ利用規約 （以下 「本規約」といいます。）のすべての条項をお読みいただき、同意していただく必要がございます。</p>
        </section>
        <section className='article-section'>
          <h2>第1条.（適用）</h2>
          <ol>
            <li>本規約は、ポストマッチ運営者 （以下 「運営者」といいます。）が提供する本サービスの利用に関する条件を定めたものとなります。利用者は、コンテンツの投稿や閲覧などその方法に関わらず、本サービスをご利用いただいたときに、本規約の全てに同意したものとみなされます。</li>
            <li>運営者が運営者ウェブサイト上で掲載する本サービスの利用に関する全てのルールは、本規約の一部を構成するものとします。</li>
            <li>本規約の内容と、前項のルールその他の本規約外における本サービスの説明等とが異なる場合は、本規約の規定が優先して適用されるものとします。ただし、投稿コンテンツの利用などに関し、利用者と運営者の間で本規約とは別の契約 （以下 「個別契約」といいます。）を書面により締結した場合は、当該個別契約の規定が本規約に優先します。</li>      
          </ol>
        </section>
        <section className='article-section'>
          <h2>第2条.（定義）</h2>
          <p>本規約において使用する用語は、次の各号に定める意味を有するものとします。</p>
          <ol>
            <li>「利用者」とは、コンテンツの投稿の有無を問わず、本サービスの閲覧など本サービスを利用されるすべての方を意味します。</li>
            <li>「会員」とは、利用者のうち、第3条（登録）に基づいて本サービスの利用者としての登録がなされた個人または法人を意味します。</li>
            <li>「投稿コンテンツ」とは、会員が投稿したコンテンツ（施設情報にかかるものも含む。）を意味します。</li>
            <li>「コンテンツ」とは、文章、画像、動画、音声等のデータを意味します。</li>      
            <li>「登録情報」とは、会員として本サービスを利用する際に必要となる、ユーザーネーム、メールアドレスおよびパスワードの情報を意味します。</li>      
            <li>「運営者ウェブサイト」とは、そのドメインが「https://post-match.com」である、運営者が運営するウェブサイト（理由の如何を問わず、運営者のウェブサイトのドメインまたは内容が変更された場合は、当該変更後のウェブサイトを含みます。）の全てを意味します。</li>      
            <li>「知的財産権」とは、著作権、特許権、実用新案権、意匠権、商標権およびその他の知的財産権（それらの権利を取得し、またはそれらの権利につき登録等を出願する権利を含みます。）を意味します。</li> 
          </ol>
          </section>
        <section className='article-section'>
        <h2>第3条.（登録）</h2>
        <ol>
          <li>本サービスにコンテンツを投稿する場合は、本規約に同意の上、予め本サービスに登録情報を登録する必要があります。</li>
          <li>運営者は、前項の登録を希望する者が以下の各号に該当する場合は、事前に通知または催告することなく登録を拒否することがあります。なお、拒否の理由は一切開示しないものとします。</li>
          <ul>
            <li> 登録情報の全部または一部につき虚偽があった場合</li>
            <li> 反社会的勢力等（暴力団、暴力団員、右翼団体、反社会的勢力およびその他これに準ずる者を意味します。以下同じ。）である、または資金提供その他を通じて反社会的勢力等の維持、運営もしくは経営に協力もしくは関与する等反社会的勢力等との何らかの交流もしくは関与を行っていると運営者が判断した場合</li>
            <li> 過去に本サービスもしくは運営者との契約に違反した者またはその関係者であると運営者が判断した場合</li>
            <li> 第10条（登録抹消等）に定める措置を受けたことがある場合</li>
            <li> 既に会員として登録されている場合</li>
            <li> その他、登録が不適当であると運営者が判断した場合</li>
          </ul>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第4条.（登録事項の変更）</h2>
        <p>会員は、登録情報に変更があった場合、運営者の定める方法により当該変更事項を遅滞なく運営者に通知するものとします。</p>
        </section>
        <section className='article-section'>
        <h2>第5条.（パスワードおよび会員情報の管理）</h2>
        <ol>
          <li>会員は、自己の責任において、本サービスに関するパスワードおよび会員情報を適切に管理および保管するものとし、これを第三者に利用させ、または貸与、譲渡、名義変更もしくは売買等をしてはならないものとします。</li>
          <li>パスワードもしくは会員情報の管理不十分、使用上の過誤または第三者の使用等によって生じた損害に関する責任は会員が負うものとします。</li>     
        </ol>
        </section>
        <section className='article-section'>
        <h2>第6条.（権利の帰属）</h2>
        <ol>
          <li>投稿コンテンツの著作権その他知的財産権は、会員または会員にライセンスを許諾している第三者に帰属し、運営者は一切の権利を取得しません。ただし、会員は、運営者に対し、投稿コンテンツについて、本サービスの運営、広告宣伝および派生著作物の作成の目的において、無償で複製、公衆送信 （送信可能化を含みます。）、翻案できる非独占的な権利を地域の限定なく許諾します。この目的外で利用する場合は、運営者は事前に会員に対し利用方法などを通知し、許諾を得るものとします。</li>
          <li>会員は、投稿コンテンツについて、投稿に関する適法で正当な権利を有しており、第三者の権利を侵害していないことを表明し、保証するものとします。</li>
          <li>会員は、投稿コンテンツについて著作者人格権を行使しないことに同意するものとします。</li>     
          <li>投稿コンテンツに関するもの以外の、運営者ウェブサイト、商品および本サービスに関するその他の知的財産権は、全て運営者または運営者にライセンスを許諾している第三者に帰属します。本規約に基づく本サービスの利用許諾は、運営者または運営者にライセンスを許諾している第三者の知的財産権の使用許諾を意味するものではありません。</li>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第7条.（禁止事項）</h2>
        <p>利用者は、本サービスの利用にあたり、以下の各号のいずれかに該当する行為または該当すると運営者が判断する行為をしてはなりません。</p>
        <ol>
          <li>本サービスにコンテンツを投稿する場合は、本規約に同意の上、予め本サービスに登録情報を登録する必要があります。</li>
          <li>運営者は、前項の登録を希望する者が以下の各号に該当する場合は、事前に通知または催告することなく登録を拒否することがあります。なお、拒否の理由は一切開示しないものとします。</li>
          <ol className='ol-bracketed'>
            <li> 法令に違反する、または犯罪行為に関連する行為</li>
            <li> 運営者、他の利用者または第三者に対する詐欺または脅迫行為</li>
            <li> 公序良俗に反する行為</li>
            <li> 運営者、他の利用者または第三者の知的財産権、肖像権、プライバシー権、名誉権、その他法令または契約上の権利を侵害する行為</li>
              <ul className='add-paragraphs'>
                <li>過度に暴力的または残虐な表現を含む情報</li>
                <li>コンピューター・ウィルスその他の有害なコンピューター・プログラムを含む情報</li>
                <li>差別を助長する表現を含む情報</li>
                <li>自殺、自傷行為を助長する表現を含む情報</li>
                <li>薬物の不適切な利用を助長する表現を含む情報</li>
                <li>反社会的な表現を含む情報</li>
                <li>チェーンメール等の第三者への情報の拡散を求める情報</li>
                <li>他人に不快感を与える表現を含む情報</li>
                <li>嫌がらせや誹謗中傷を目的とした表現を含む情報</li>
                <li>運営者ウェブサイトに掲載された本サービスの目的に反し、またはこれと関係がない情報</li>
                <li>他の利用者を揶揄しまたは利用者間の対立を煽る表現を含む情報</li>
              </ul>
            <li> 意図的に虚偽の情報を流布させる行為</li>
            <li> 不正アクセスまたは本サービスの他の会員の登録情報等を利用する行為</li>
            <li> 意図的に虚偽の情報を流布させる行為</li>
            <li> 運営者ウェブサイトを構成する一切のデータ(投稿コンテンツを含む。)を収集する行為(スクレイピング及びクローリングを含むがこれらの手法に限らない。)、自動化された手段(情報収集ボット、ロボット、スパイダー、スクレーパーなど)を使用して本サービスにアカウント登録したりアクセスしたりする行為、本サービスによって提供される機能を複製、修正、転載、改変、変更、リバースエンジニアリング、逆アセンブル、逆コンパイル、翻訳もしくは解析する行為、その入手経路を問わず運営者ウェブサイトを構成する一切のデータ(投稿コンテンツを含む。)を運営者の許可なく利用する行為、本サービスのサーバやネットワークに支障を与える行為および本サービスの運営や利用者による本サービスの利用を妨げる行為。</li>
            <li> 第三者に成りすます行為</li>
            <li> 本サービスの他の利用者の情報の収集</li>
            <li> 運営者、他の利用者または第三者に不利益、損害、不快感を与える行為</li>
            <li> 会員として既に登録されているにもかかわらず第3条（登録）にかかる登録を求める行為</li>
            <li> 反社会的勢力等への利益供与</li>
            <li> 性行為やわいせつな行為を行うために面識のない他人（異性に限らない）と出会うことを目的とした行為</li>
            <li> その他、運営者が不適当と判断した行為</li>
          </ol>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第8条.（本サービスの停止等）</h2>
        <p>運営者は、以下のいずれかに該当する場合には、利用者に事前に通知することなく、本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
        <ol>
          <li>本サービスに係るコンピューター・システムの点検または保守作業を緊急に行う場合</li>
          <li>コンピューター、通信回線等の障害、誤操作、過度なアクセスの集中、不正アクセスまたはハッキング等により本サービスの運営ができなくなった場合</li>
          <li>地震、落雷、火災、風水害、停電または天災地変などの不可抗力により本サービスの運営ができなくなった場合</li>     
          <li>その他、運営者が停止または中断を必要と判断した場合</li>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第9条.（本サービスの変更および終了）</h2>
        <p>運営者は、運営者の都合により、利用者に対して事前の通知をすることなく本サービスの内容を変更することができ、また事前に通知することにより本サービスを終了することができます。</p>
        </section>
        <section className='article-section'>
        <h2>第10条.（登録抹消等）</h2>
        <p>運営者は、会員が以下の各号のいずれかの事由に該当する場合または該当すると合理的な根拠に基づき運営者が判断した場合は、事前に通知または催告することなく、また当該会員に対してその理由を示すことなく、当該会員が投稿した投稿コンテンツを削除もしくは非表示にすること、当該会員について、商品の購入も含む本サービスの全ての利用を一時的に停止すること、または会員の登録を抹消することができます。</p>
        <ol>
          <li>本規約のいずれかの条項に違反した場合</li>
          <li>登録情報に虚偽の事実があることが判明した場合</li>
          <li>第3条（登録）第2項各号に該当する場合</li>     
          <li>その他、運営者が会員としての登録の継続を適当でないと判断した場合</li>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第11条.（秘密保持）</h2>
        <p>利用者は、本サービスに関連して運営者が利用者に対して秘密に取扱うことを求めて開示した非公知の情報について、運営者の事前の書面による承諾がある場合を除き、秘密に取扱うものとします。</p>
        </section>
        <section className='article-section'>
        <h2>第12条.（個人情報の取扱い）</h2>
        <p>運営者による利用者の個人情報の取扱いについては、別途プライバシーポリシーの定めによるものとし、利用者はこのプライバシーポリシーに従って運営者が利用者の個人情報を取扱うことについて同意するものとします。</p>
        </section>
        <section className='article-section'>
        <h2>第13条.（本規約の変更）</h2>
        <ol>
          <li>運営者は、運営者が必要と認めた場合は、本規約を変更できるものとします。 </li>
          <li>本規約を変更する場合、変更後の本規約の施行時期および内容を運営者ウェブサイト上での掲載その他の適切な方法により周知します。</li>
          <li>変更後の規約は、前項の施行時期からその効力を生じるものとし、利用者は、本規約の変更後も本サービスの利用を継続することで、変更後の本規約に同意したものとみなします。</li>     
        </ol>
        </section>
        <section className='article-section'>
        <h2>第14条.（連絡／通知）</h2>
        <ol>
          <li>本サービスに関する問い合わせその他利用者から運営者に対する連絡または通知、および運営者から利用者に対する連絡または通知は、運営者の定める方法で行うものとします。 </li>
          <li>運営者が登録情報に含まれるメールアドレス・その他の連絡先に連絡または通知を行った場合、会員は当該連絡または通知を受領したものとみなします。</li>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第15条.（免責等）</h2>
        <ol>
          <li>運営者は、本サービスが利用者の特定の目的に適合すること、期待する機能・商品的価値・正確性・有用性を有すること、利用者による本サービスの利用が利用者に適用のある法令または業界団体の内部規則等に適合すること、継続的に利用できること、および不具合が生じないことについて、明示または黙示を問わず何ら保証するものではなく、これらに関する瑕疵を除去する義務を利用者に対して負いません。 </li>
          <li>運営者は、運営者の責めに帰すべき事由により本サービスに関して利用者が被った損害につき、運営者に故意または重過失がある場合を除き、過去3ヶ月間に当該会員が運営者に支払った対価の金額を超えて賠償する責任を負わないものとし、また、付随的損害、間接損害、特別損害、将来の損害および逸失利益にかかる損害については、賠償する責任を負わないものとします。ただし、本規約においてこれと異なる定めがある場合はこの限りではありません。</li>
          <li>本サービスまたは運営者ウェブサイトに関連して利用者と他の利用者または第三者との間に生じた取引、連絡または紛争等については、利用者が自己の責任により解決するものとします。 </li>
          <li>運営者は、運営者ウェブサイト上の任意のページに運営者または第三者の広告を掲載することができるものとします。 </li>
        </ol>
        </section>
        <section className='article-section'>
        <h2>第16条.（分離可能性）</h2>
        <p>本規約のいずれかの条項またはその一部が、消費者契約法その他の法令等により無効または執行不能と判断された場合であっても、本規約のその他の条項および一部が無効または執行不能と判断された条項の残りの部分については、継続して完全に効力を有するものとします。</p>
        </section>
        <section className='article-section'>
        <h2>第17条.（準拠法および管轄裁判所）</h2>
        <p>本規約および個別契約の準拠法は日本法とします。本サービス、本規約および個別契約に関連する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </section>
        <p>2023年8月1日 施行</p>
      </div>
    </>
  )
}

export default Term;