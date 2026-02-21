"use client";

import Link from "next/link";
import { M, Eq } from "@/components/Math";

export default function DerivationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">
            Solving the Harmonic Oscillator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Full analytical solution of the 1D quantum harmonic oscillator
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-md text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Back to Visualizer
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 leading-relaxed text-gray-300">
        {/* ── Step 0 ─────────────────────────────────────────── */}
        <Section n={0} title="The problem">
          <p>
            We want to solve the <em>time-dependent</em> Schrödinger equation
            for a particle of mass <M>m</M> in the quadratic potential{" "}
            <M>{"V(x) = \\tfrac{1}{2}m\\omega^2 x^2"}</M>:
          </p>
          <Eq label="TDSE">
            {"i\\hbar \\frac{\\partial}{\\partial t}\\Psi(x,t) = \\hat{H}\\,\\Psi(x,t)"}
          </Eq>
          <p>where the Hamiltonian is</p>
          <Eq label="H">
            {"\\hat{H} = -\\frac{\\hbar^2}{2m}\\frac{\\partial^2}{\\partial x^2} + \\frac{1}{2}m\\omega^2 x^2"}
          </Eq>
          <p>
            The strategy is classical: separate variables to reduce the
            time-dependent problem to a <em>time-independent</em> eigenvalue
            equation, solve that eigenvalue equation exactly, then reassemble the
            full solution as a superposition.
          </p>
        </Section>

        {/* ── Step 1 ─────────────────────────────────────────── */}
        <Section n={1} title="Separation of variables">
          <p>
            Assume the solution factorises as
          </p>
          <Eq>{"\\Psi(x,t) = \\psi(x)\\,T(t)"}</Eq>
          <p>
            Substituting into the TDSE and dividing both sides by{" "}
            <M>{"\\psi(x)T(t)"}</M>:
          </p>
          <Eq>
            {"i\\hbar \\frac{1}{T}\\frac{dT}{dt} = \\frac{1}{\\psi}\\hat{H}\\psi = E"}
          </Eq>
          <p>
            The left side depends only on <M>t</M> and the right only on{" "}
            <M>x</M>, so both must equal a constant <M>E</M>. This gives us two
            independent equations.
          </p>

          <p className="font-semibold text-gray-200 mt-4">Time part:</p>
          <Eq>
            {"i\\hbar \\frac{dT}{dt} = ET \\quad\\Longrightarrow\\quad T(t) = e^{-iEt/\\hbar}"}
          </Eq>
          <p>
            This is just a phase factor — the spatial shape does not change for a
            stationary state, only its complex phase rotates.
          </p>

          <p className="font-semibold text-gray-200 mt-4">
            Spatial part (time-independent Schrödinger equation):
          </p>
          <Eq label="TISE">
            {"-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi}{dx^2} + \\frac{1}{2}m\\omega^2 x^2\\,\\psi = E\\,\\psi"}
          </Eq>
          <p>
            Our task reduces to finding all functions <M>{"\\psi(x)"}</M> and
            corresponding energies <M>E</M> that satisfy this equation with{" "}
            <M>{"\\psi \\to 0"}</M> as <M>{"x \\to \\pm\\infty"}</M>.
          </p>
        </Section>

        {/* ── Step 2 ─────────────────────────────────────────── */}
        <Section n={2} title="Non-dimensionalisation">
          <p>
            Introduce the dimensionless variable
          </p>
          <Eq>{"\\xi = \\sqrt{\\frac{m\\omega}{\\hbar}}\\; x"}</Eq>
          <p>and define the dimensionless energy</p>
          <Eq>{"\\varepsilon = \\frac{2E}{\\hbar\\omega}"}</Eq>
          <p>Then the TISE becomes</p>
          <Eq label="dimless">
            {"\\frac{d^2\\psi}{d\\xi^2} + \\left(\\varepsilon - \\xi^2\\right)\\psi = 0"}
          </Eq>
          <p>
            This is cleaner — all the physical constants have been absorbed. Now
            we need to solve this ODE subject to square-integrability.
          </p>
        </Section>

        {/* ── Step 3 ─────────────────────────────────────────── */}
        <Section n={3} title="Asymptotic analysis">
          <p>
            For large <M>{"|\\xi|"}</M>, the <M>{"\\varepsilon"}</M> term is
            negligible compared to <M>{"\\xi^2"}</M>, giving the approximate
            equation
          </p>
          <Eq>{"\\frac{d^2\\psi}{d\\xi^2} \\approx \\xi^2\\,\\psi"}</Eq>
          <p>
            whose normalizable solutions behave like{" "}
            <M>{"e^{-\\xi^2/2}"}</M>. (The growing solution{" "}
            <M>{"e^{+\\xi^2/2}"}</M> is discarded as non-normalizable.) This
            motivates the ansatz:
          </p>
          <Eq label="ansatz">
            {"\\psi(\\xi) = h(\\xi)\\,e^{-\\xi^2/2}"}
          </Eq>
          <p>
            where <M>{"h(\\xi)"}</M> is some function that grows at most
            polynomially (so the Gaussian dominates and the solution is
            square-integrable).
          </p>
        </Section>

        {/* ── Step 4 ─────────────────────────────────────────── */}
        <Section n={4} title="Hermite's differential equation">
          <p>
            Substituting the ansatz into the dimensionless TISE and
            simplifying (compute <M>{"\\psi'"}</M> and <M>{"\\psi''"}</M> via
            product rule):
          </p>
          <Eq>
            {"\\frac{d^2h}{d\\xi^2} - 2\\xi\\frac{dh}{d\\xi} + (\\varepsilon - 1)\\,h = 0"}
          </Eq>
          <p>
            This is <strong>Hermite&rsquo;s equation</strong>. Let us solve it
            by power series. Write
          </p>
          <Eq>{"h(\\xi) = \\sum_{j=0}^{\\infty} a_j\\,\\xi^j"}</Eq>
          <p>
            Substituting and collecting powers of <M>{"\\xi^j"}</M> yields the
            two-term recurrence relation:
          </p>
          <Eq label="recurrence">
            {"a_{j+2} = \\frac{2j + 1 - \\varepsilon}{(j+1)(j+2)}\\;a_j"}
          </Eq>
        </Section>

        {/* ── Step 5 ─────────────────────────────────────────── */}
        <Section n={5} title="Quantisation of energy">
          <p>
            For large <M>j</M>, the ratio <M>{"a_{j+2}/a_j \\to 2/j"}</M>,
            which is the same as the Taylor coefficients of{" "}
            <M>{"e^{\\xi^2}"}</M>. If the series does not terminate,{" "}
            <M>{"h(\\xi)"}</M> grows like <M>{"e^{\\xi^2}"}</M>, overpowering
            the <M>{"e^{-\\xi^2/2}"}</M> factor and making <M>{"\\psi"}</M>{" "}
            blow up. Therefore the series <strong>must terminate</strong>.
          </p>
          <p className="mt-3">
            The series terminates at <M>{"j = n"}</M> when the numerator of the
            recurrence vanishes:
          </p>
          <Eq>{"2n + 1 - \\varepsilon = 0"}</Eq>
          <p>Substituting back <M>{"\\varepsilon = 2E/(\\hbar\\omega)"}</M>:</p>
          <Eq label="energies">
            {"E_n = \\hbar\\omega\\!\\left(n + \\tfrac{1}{2}\\right), \\qquad n = 0,\\,1,\\,2,\\,\\dots"}
          </Eq>
          <p>
            This is the celebrated <strong>quantisation condition</strong>:
            energy levels are equally spaced by <M>{"\\hbar\\omega"}</M> with a
            zero-point energy of <M>{"\\tfrac{1}{2}\\hbar\\omega"}</M>. The
            ground state has nonzero energy — a purely quantum effect with no
            classical analogue.
          </p>
        </Section>

        {/* ── Step 6 ─────────────────────────────────────────── */}
        <Section n={6} title="Hermite polynomials">
          <p>
            With the termination condition, <M>{"h(\\xi)"}</M> becomes a
            polynomial of degree <M>n</M>. These are the{" "}
            <strong>Hermite polynomials</strong> <M>{"H_n(\\xi)"}</M> (physicist&rsquo;s
            convention). They can be defined by the <em>Rodrigues formula</em>:
          </p>
          <Eq label="rodrigues">
            {"H_n(\\xi) = (-1)^n\\,e^{\\xi^2}\\frac{d^n}{d\\xi^n}e^{-\\xi^2}"}
          </Eq>
          <p>The first several are:</p>
          <div className="bg-gray-900 rounded-lg p-4 my-4 space-y-2">
            <Eq>{"H_0(\\xi) = 1"}</Eq>
            <Eq>{"H_1(\\xi) = 2\\xi"}</Eq>
            <Eq>{"H_2(\\xi) = 4\\xi^2 - 2"}</Eq>
            <Eq>{"H_3(\\xi) = 8\\xi^3 - 12\\xi"}</Eq>
            <Eq>{"H_4(\\xi) = 16\\xi^4 - 48\\xi^2 + 12"}</Eq>
          </div>
          <p>
            Key property: <M>{"H_n"}</M> has exactly <M>n</M> real zeros, so
            the <M>n</M>-th energy eigenstate has <M>n</M> nodes — consistent
            with the general nodal theorem of quantum mechanics.
          </p>
        </Section>

        {/* ── Step 7 ─────────────────────────────────────────── */}
        <Section n={7} title="Normalised stationary states">
          <p>
            Assembling the pieces: the normalised energy eigenstates
            (stationary states) are
          </p>
          <Eq label="eigenstates">
            {"\\psi_n(x) = \\left(\\frac{m\\omega}{\\pi\\hbar}\\right)^{\\!1/4} \\frac{1}{\\sqrt{2^n\\,n!}}\\; H_n\\!\\left(\\sqrt{\\frac{m\\omega}{\\hbar}}\\,x\\right) e^{-m\\omega x^2 / 2\\hbar}"}
          </Eq>
          <p>
            The normalisation constant comes from the integral
          </p>
          <Eq>
            {"\\int_{-\\infty}^{\\infty} H_m(\\xi)\\,H_n(\\xi)\\,e^{-\\xi^2}\\,d\\xi = \\sqrt{\\pi}\\,2^n\\,n!\\;\\delta_{mn}"}
          </Eq>
          <p>
            These eigenstates form a complete orthonormal basis for{" "}
            <M>{"L^2(\\mathbb{R})"}</M>.
          </p>
        </Section>

        {/* ── Step 8 ─────────────────────────────────────────── */}
        <Section n={8} title="General time-dependent solution">
          <p>
            Since the stationary states form a complete basis, <em>any</em>{" "}
            normalizable initial condition <M>{"\\Psi(x,0)"}</M> can be
            expanded as
          </p>
          <Eq>
            {"\\Psi(x,0) = \\sum_{n=0}^{\\infty} c_n\\,\\psi_n(x)"}
          </Eq>
          <p>
            where the expansion coefficients are found by projection:
          </p>
          <Eq label="coeffs">
            {"c_n = \\int_{-\\infty}^{\\infty} \\psi_n(x)^*\\,\\Psi(x,0)\\,dx"}
          </Eq>
          <p>
            Each stationary state picks up its own phase factor{" "}
            <M>{"e^{-iE_n t/\\hbar}"}</M>, so the full time-dependent solution
            is:
          </p>
          <Eq label="general">
            {"\\boxed{\\Psi(x,t) = \\sum_{n=0}^{\\infty} c_n\\,\\psi_n(x)\\,e^{-i(n+1/2)\\omega t}}"}
          </Eq>
          <p>
            This is the exact, closed-form general solution. Every term
            oscillates at frequency <M>{"(n+\\tfrac{1}{2})\\omega"}</M>, and
            the interference between terms with different <M>n</M> produces all
            the non-trivial dynamics you see in the visualizer.
          </p>
        </Section>

        {/* ── Step 9 ─────────────────────────────────────────── */}
        <Section n={9} title="Ladder operator method (algebraic approach)">
          <p>
            There is an elegant algebraic alternative. Define the{" "}
            <strong>ladder operators</strong>:
          </p>
          <Eq>
            {"\\hat{a} = \\sqrt{\\frac{m\\omega}{2\\hbar}}\\left(\\hat{x} + \\frac{i\\hat{p}}{m\\omega}\\right), \\qquad \\hat{a}^\\dagger = \\sqrt{\\frac{m\\omega}{2\\hbar}}\\left(\\hat{x} - \\frac{i\\hat{p}}{m\\omega}\\right)"}
          </Eq>
          <p>They satisfy the canonical commutation relation</p>
          <Eq>{"[\\hat{a},\\,\\hat{a}^\\dagger] = 1"}</Eq>
          <p>and the Hamiltonian rewrites as</p>
          <Eq>
            {"\\hat{H} = \\hbar\\omega\\left(\\hat{a}^\\dagger\\hat{a} + \\tfrac{1}{2}\\right)"}
          </Eq>
          <p>
            The number operator{" "}
            <M>{"\\hat{N} = \\hat{a}^\\dagger\\hat{a}"}</M> has
            non-negative integer eigenvalues <M>{"n = 0, 1, 2, \\dots"}</M>.
            The ground state <M>{"|0\\rangle"}</M> is defined by
          </p>
          <Eq>{"\\hat{a}\\,|0\\rangle = 0"}</Eq>
          <p>
            which is a first-order ODE that directly yields the Gaussian ground
            state. All excited states are obtained by repeated application of the
            raising operator:
          </p>
          <Eq label="ladder">
            {"|n\\rangle = \\frac{(\\hat{a}^\\dagger)^n}{\\sqrt{n!}}\\,|0\\rangle"}
          </Eq>
          <p>
            This algebraic structure — a single pair of ladder operators
            generating an infinite tower of equally spaced states — is the
            prototype for quantum field theory, where <M>{"\\hat{a}^\\dagger"}</M>{" "}
            and <M>{"\\hat{a}"}</M> create and destroy particles.
          </p>
        </Section>

        {/* ── Step 10 ────────────────────────────────────────── */}
        <Section n={10} title="What the visualizer computes">
          <p>
            The analytical solution above is exact but requires computing an
            infinite sum of Hermite polynomials. The visualizer instead solves
            the TDSE <em>numerically</em> using the{" "}
            <strong>split-operator Fourier transform</strong> (SOFT) method,
            which works for <em>any</em> potential (not just the harmonic
            oscillator).
          </p>
          <p className="mt-3">The idea: over a small time step <M>{"\\Delta t"}</M>, approximate</p>
          <Eq>
            {"e^{-i\\hat{H}\\Delta t/\\hbar} \\approx e^{-i\\hat{V}\\Delta t/2\\hbar}\\; e^{-i\\hat{T}\\Delta t/\\hbar}\\; e^{-i\\hat{V}\\Delta t/2\\hbar}"}
          </Eq>
          <p>
            The potential operator <M>{"\\hat{V}"}</M> is diagonal in position
            space (just multiply pointwise). The kinetic operator{" "}
            <M>{"\\hat{T} = \\hat{p}^2/2m"}</M> is diagonal in{" "}
            <em>momentum</em> space. So each step is:
          </p>
          <ol className="list-decimal list-inside space-y-1 my-3 ml-4 text-gray-400">
            <li>Multiply <M>{"\\psi(x)"}</M> by <M>{"e^{-iV(x)\\Delta t/2\\hbar}"}</M></li>
            <li>FFT to momentum space</li>
            <li>Multiply <M>{"\\tilde{\\psi}(k)"}</M> by <M>{"e^{-i\\hbar k^2 \\Delta t / 2m}"}</M></li>
            <li>Inverse FFT back to position space</li>
            <li>Multiply by <M>{"e^{-iV(x)\\Delta t/2\\hbar}"}</M> again</li>
          </ol>
          <p>
            This &ldquo;VTV&rdquo; splitting is unitary (preserves norm) and
            second-order accurate in <M>{"\\Delta t"}</M>. The FFT makes each
            step <M>{"O(N \\log N)"}</M>, which is fast enough to run in real
            time in the browser.
          </p>
        </Section>

        {/* ── Step 11 ────────────────────────────────────────── */}
        <Section n={11} title="Physical intuition">
          <p>Some key phenomena to observe in the visualizer:</p>
          <ul className="list-disc list-inside space-y-2 my-3 ml-4 text-gray-400">
            <li>
              <strong className="text-gray-300">Coherent oscillation:</strong>{" "}
              A Gaussian wave packet displaced from the origin oscillates back
              and forth — it is a <em>coherent state</em> (eigenstate of{" "}
              <M>{"\\hat{a}"}</M>), the closest quantum analogue of classical
              motion.
            </li>
            <li>
              <strong className="text-gray-300">Breathing / squeezing:</strong>{" "}
              If the initial width does not match the ground state width{" "}
              <M>{"\\sigma_0 = \\sqrt{\\hbar/m\\omega}"}</M>, the packet
              periodically narrows and widens (&ldquo;breathes&rdquo;) at
              frequency <M>{"2\\omega"}</M>.
            </li>
            <li>
              <strong className="text-gray-300">Revivals:</strong>{" "}
              Because the energy levels are <em>exactly</em> equally spaced, the
              wavefunction perfectly reconstructs at integer multiples of the
              classical period <M>{"T = 2\\pi/\\omega"}</M> — a special
              property of the harmonic oscillator.
            </li>
            <li>
              <strong className="text-gray-300">Zero-point motion:</strong>{" "}
              Even the ground state has{" "}
              <M>{"\\langle x^2 \\rangle = \\hbar / 2m\\omega \\neq 0"}</M>.
              The particle can never be at rest — a direct consequence of the
              uncertainty principle.
            </li>
          </ul>
        </Section>

        {/* Back link */}
        <div className="mt-12 mb-8 border-t border-gray-800 pt-6">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            &larr; Back to the visualizer
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-100 mb-3">
        <span className="text-blue-400 mr-2">Step {n}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-[15px]">{children}</div>
    </section>
  );
}
