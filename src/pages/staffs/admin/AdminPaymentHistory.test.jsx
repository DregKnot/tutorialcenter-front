jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/" }),
  Link: ({ children }) => children,
}), { virtual: true });

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

import { isFreeGrant, getFreeGrantLabel } from "./AdminPaymentHistory.jsx";

describe("AdminPaymentHistory Financial & Free Grant Rules", () => {
  test("Showunmi Deborah case: amount > 0 with gateway=complimentary is recognized as PAID revenue, NEVER a Free Grant", () => {
    const payment = {
      id: 10,
      student_id: 33,
      amount: "8000.00",
      status: "successful",
      payment_method: "card",
      gateway: "complimentary",
      gateway_reference: "TC-1790003177806-33",
      meta: {
        type: "complimentary",
        reason: "Completing incomplete student registration",
        created_by_staff_id: 1,
      },
    };

    expect(isFreeGrant(payment)).toBe(false);
    expect(getFreeGrantLabel(payment)).toBe("PAID");
  });

  test("Victory Chukwuji case: amount > 0 with gateway=bank is recognized as PAID revenue", () => {
    const payment = {
      id: 24,
      student_id: 70,
      amount: "8000.00",
      status: "successful",
      payment_method: "bank_transfer",
      gateway: "bank",
      gateway_reference: "TC-EH4VRH",
      meta: { bank_transfer: {} },
    };

    expect(isFreeGrant(payment)).toBe(false);
    expect(getFreeGrantLabel(payment)).toBe("PAID");
  });

  test("True Free Grant: amount <= 0 with complimentary gateway is a Free Grant", () => {
    const freePayment = {
      id: 18,
      student_id: 26,
      amount: "0.00",
      status: "successful",
      payment_method: "manual",
      gateway: "complimentary",
      gateway_reference: "FREE-12345",
      meta: { type: "complimentary" },
    };

    expect(isFreeGrant(freePayment)).toBe(true);
    expect(getFreeGrantLabel(freePayment)).toBe("FREE GRANT");
  });

  test("True Scholarship: amount 0 with waiver_type=scholarship", () => {
    const scholarshipPayment = {
      id: 99,
      amount: 0,
      status: "successful",
      gateway: "complimentary",
      meta: { waiver_type: "scholarship" },
    };

    expect(isFreeGrant(scholarshipPayment)).toBe(true);
    expect(getFreeGrantLabel(scholarshipPayment)).toBe("SCHOLARSHIP");
  });

  test("Scholarship with FREE-GRANT-[integer] reference", () => {
    const payment = {
      id: 101,
      amount: "0.00",
      status: "successful",
      gateway: "complimentary",
      gateway_reference: "FREE-GRANT-184920",
    };

    expect(isFreeGrant(payment)).toBe(true);
    expect(getFreeGrantLabel(payment)).toBe("SCHOLARSHIP");
  });

  test("Free Grant with FREE-[integer] reference", () => {
    const payment = {
      id: 102,
      amount: 0,
      status: "successful",
      gateway: "complimentary",
      gateway_reference: "FREE-748291",
    };

    expect(isFreeGrant(payment)).toBe(true);
    expect(getFreeGrantLabel(payment)).toBe("FREE GRANT");
  });

  test("Pending or failed payment with amount > 0 is not a free grant", () => {
    const pendingPayment = {
      id: 100,
      amount: "15000.00",
      status: "pending",
      gateway: "complimentary",
    };

    expect(isFreeGrant(pendingPayment)).toBe(false);
  });
});
