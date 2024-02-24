const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key:
      `-----BEGIN PRIVATE KEY-----\n${process.env.PRIVATE_KEY}\n/b2PISwnD7IPiYlT61c4ZvPk7OmJK56P9Mmi9syTN5pHA+7LVNv11/m9vLwFb2ox\n+0Cjq3SaLPN9HbotTScgqsuKmBqO0GoRHQkFPGHaaiPZfRI+oMiygANt7rnZceYD\ne3QEITqhEMRNWvwquQD+CXcuAIonVn+J0VWFx3LvD8TgqYuC/tyUk3L/Onwbr+cn\nEjpErnl+GBiNt0kSQ6euSU06ANzv89V2v/pzXlGSdYz9ofSE+wWS9/9OEWSokVtK\nHqWa36z+S+lSTdjIC/UGJMfJAGj4qN+NGHVzszM+flWWFIDPfZDdRWbGEMneCu3A\nRopgI66hAgMBAAECggEACxTIM782vCr3yI3aqYji/WLmoE1PMcpz4+7MEKEuIp5m\n+WGIFvhZvvzYry5lV4HAcQw4YePoEvJoTuBa1m2XPxyfqTOkPLA8zjt+MQSGH9HK\nBOeTRMV3tYNtXy2wZNIloRA555o4MEcpaMxHbuHMECT4TrD7+x2DniPs87xuDJ09\nJgro7qP+2lB/4AJ9Oaz+MiAXmi980viXY0O5akJ7xBGOOFs0uZsQCd70/8nTcR7X\nGfG1FpBjgQ7MRT3lv+v1a/a1Q2fuCEhyZNchXSqjxl8xsXZCd6WcKwwPQ8MhTQ9v\ndrWlG7OWO/zw60zRD68H44/CBUryQjN8oURrRBCAfwKBgQDXLVzCmiNWInbQAfAr\nGAL6fa/8SZtrLZ4bFdPdxPuJdjYscDu+Wbo9iNGJjAzCDFs05tpMFNbkXlWDYHAp\nZowTRPqNUmn2xDV4RGarX8cOaGf1j41QM0bWj5p3AZeRFFRA2GP9UCNqwMxpTSGW\nOstauTID16MliQayqvefXhoWHwKBgQDPUdsBlFN1VAYh9ReXoZxHYF59S77DImFi\nqo9vU9CqxJGWfYeD6ffqCv4lPgsA4LEXrwWm+zOqa2wYeiPB+i2gs+QADu4yocXG\n/mBmU0xoGTGvWfWUqEyb80FZ2biyCm6SWZnaALB/U3Pi/ptcEYrU9OPl1KlQ18AW\nTZqQbw4jPwKBgGIYTwJ0bImW+p1HVOsAblMtu24DTHQm/r4QTF78r0Nyfa3ymHnl\nw+7LkeLn0uUf5vCOEZS/p1vC2a8j5t4o3tDmEGce3CngNxQV8sxLxJ5/4GzlPaID\nTlcAboW0VxmPr/1D6QmRYCQJsuaKgDZRpWU9qlxwEPNKraAEKxEfQDs3AoGAGPTA\niTsipL/9kP7g3SbeGhV2qlyA1RqBYJApffw35SaOY/AubOmwJyM1nqQOTQe/KZuu\n8X/Ro1UVCQlC3qnP7kVZT8x8Ten9VcvvLMIgM3O88F/C2Sc9OZSZrEgyHHR3BPT2\nOTDWDi2siImfiACwlpv4BwWHcCzYeZbT4UkNCZ8CgYARtGb2094usag0wSyDL0RY\nOr/fE+bNzd2wotKFA8QadMkpKiL3CSLnjBiaJhXVXlO1lE2ieckpyUrYE20iytYa\nmUmKmwpDUMtGqmKxuDClSoFSHSSFkT0d3+hcBOksQx9GXBtYgC84ldIoSTHI2HQ0\ndMaZyOfIe+P0vbEVsfZq3g==\n-----END PRIVATE KEY-----\n`,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
  }),
});

module.exports = admin;
