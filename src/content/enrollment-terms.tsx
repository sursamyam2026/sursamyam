/**
 * Canonical Terms & Conditions for Sur Samyam online enrollment.
 * TODO: Revisit payment gateway and refund language when online payments are integrated.
 */

export function EnrollmentTermsContent() {
  return (
    <div className="space-y-6 text-sm text-[#4A5E52] [&_h3]:font-display [&_h3]:text-[#1B4D3E] [&_h3]:text-base [&_table]:w-full [&_table]:text-left [&_th]:border [&_th]:border-[#E8D5A3] [&_th]:bg-[#F5ECD7] [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-[#E8D5A3] [&_td]:px-3 [&_td]:py-2">
      <section>
        <h3>Payments and Refunds</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            Payment instructions will be shared by Sur Samyam during the enrollment process.
          </li>
          <li>We follow a strict <strong>no-refund policy</strong> except as explicitly stated below.</li>
          <li>
            If a student pays monthly fees twice by mistake, the excess amount may be{" "}
            <strong>refunded via the same source</strong> or <strong>adjusted against the next payment cycle</strong>,
            at Sur Samyam&apos;s discretion.
          </li>
          <li>
            Any transaction or service charges applied by a payment provider, if applicable,{" "}
            <strong>cannot be refunded or reversed</strong>.
          </li>
        </ul>
      </section>

      <section>
        <h3>Transaction charges</h3>
        <p className="mt-2">
          If payments are collected through a third-party provider in the future, any applicable{" "}
          <strong>transaction charges</strong> may be communicated separately before payment.
        </p>
      </section>

      <section>
        <h3>Registration fees</h3>
        <p className="mt-2">
          A <strong>non-refundable</strong>, one-time <strong>registration fee of ₹1,000</strong> applies for new
          students. It covers online platform access, student account setup, course materials, technical support setup,
          enrollment processing, and reserving a place in Sur Samyam&apos;s structured online Hindustani vocal
          curriculum.
        </p>
      </section>

      <section>
        <h3>Due date of monthly fee payment</h3>
        <p className="mt-2">
          Students must pay monthly fees <strong>on or before</strong> the documented due date each month. The{" "}
          <strong>first day of joining class</strong> establishes the recurring <strong>due date</strong> for monthly fee
          payments.
        </p>
      </section>

      <section>
        <h3>Late fees and penalty</h3>
        <p className="mt-2">
          Payments received <strong>after</strong> the due date may attract <strong>system-calculated late fees</strong>.
          These may increase weekly; manual waivers may not always be possible. Late fees encourage timely payment,
          reflect administrative handling, and keep the process fair for students who pay on time.
        </p>
        <table className="mt-3 text-sm">
          <thead>
            <tr>
              <th>Days after due date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1–7 days</td>
              <td>₹200</td>
            </tr>
            <tr>
              <td>8–14 days</td>
              <td>₹400</td>
            </tr>
            <tr>
              <td>15–21 days</td>
              <td>₹600</td>
            </tr>
            <tr>
              <td>22–28 days</td>
              <td>₹800</td>
            </tr>
            <tr>
              <td>More than 28 days</td>
              <td>₹1,000</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>Class cycle</h3>
        <p className="mt-2">
          There are <strong>four</strong> lesson blocks aligned with typical <strong>four weeks</strong> each month.
          Months with a fifth week may have <strong>no regular class</strong> scheduled in that fifth week unless
          otherwise communicated.
        </p>
      </section>

      <section>
        <h3>Missing a class · Class recordings</h3>
        <p className="mt-2">
          Sur Samyam offers <strong>live vocal instruction</strong>. Classes are interactive; being present and attentive
          is essential. If the Guru determines a <strong>recording</strong> is necessary for a student&apos;s progress,
          guidance will be given on a case-by-case basis. General availability of recordings is{" "}
          <strong>not guaranteed</strong> unless provided by the teacher.
        </p>
        <p className="mt-2">
          In the event of a <strong>student-initiated absence</strong>, the teacher will offer compensation for a
          maximum of <strong>2 classes per month</strong>. We encourage students to plan their schedules mindfully to
          make the most of every class.
        </p>
      </section>

      <section>
        <h3>Pictures and recordings</h3>
        <p className="mt-2">
          Sur Samyam may capture photographs and audio/video of students occasionally, related to lessons and
          performances. Sur Samyam reserves the right to use such media on its website, social channels, print
          materials, and similar. Guardian consent applies for minors where required by applicable law.
        </p>
      </section>
    </div>
  );
}
