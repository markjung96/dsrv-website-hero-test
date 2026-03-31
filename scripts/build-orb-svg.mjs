#!/usr/bin/env node
/**
 * Figma 컨투어 오브 SVG 합성 스크립트
 * 152개 벡터 레이어를 다운로드 → 단일 SVG로 합성
 */

const ASSETS = [
  { url: "https://www.figma.com/api/mcp/asset/7d348083-4e3f-4fd0-9063-3421bdff76cb", inset: [0.38, 0.21, 0.31, 0.33] },
  { url: "https://www.figma.com/api/mcp/asset/1169253c-de46-4e04-9f07-53773476b35b", inset: [0.77, 0.41, 0.62, 0.67] },
  { url: "https://www.figma.com/api/mcp/asset/3cfdc37c-50c0-4dfe-84ed-3949414d9ec5", inset: [1.15, 0.62, 0.95, 1.0] },
  { url: "https://www.figma.com/api/mcp/asset/f7af76d8-8f20-426c-82aa-37de4412475d", inset: [1.54, 0.84, 1.26, 1.33] },
  { url: "https://www.figma.com/api/mcp/asset/eaba3dbf-f16f-4d94-93f3-8e02e1ec7a27", inset: [1.92, 1.05, 1.57, 1.67] },
  { url: "https://www.figma.com/api/mcp/asset/b1b7071d-2994-40c5-a81c-65da249c73c3", inset: [2.3, 1.26, 1.88, 2.0] },
  { url: "https://www.figma.com/api/mcp/asset/df6ef8fb-8a50-4d2c-9ecb-2c8857434d1a", inset: [2.68, 1.47, 2.2, 2.33] },
  { url: "https://www.figma.com/api/mcp/asset/d201ac63-f512-4d2f-9a1b-4c1561227cf3", inset: [3.07, 1.68, 2.51, 2.67] },
  { url: "https://www.figma.com/api/mcp/asset/7b6c905b-fcc6-4d5b-a470-b4b5bde03d56", inset: [3.45, 1.89, 2.81, 3.0] },
  { url: "https://www.figma.com/api/mcp/asset/d68025ab-790f-48d4-8bf0-004b37c84d5e", inset: [3.83, 2.1, 3.12, 3.33] },
  { url: "https://www.figma.com/api/mcp/asset/98d8033d-3ba8-4544-b946-9b6ef5196894", inset: [4.21, 2.3, 3.43, 3.67] },
  { url: "https://www.figma.com/api/mcp/asset/cf2bb429-cbc5-4b8a-bb28-21718311b9e0", inset: [4.59, 2.51, 3.74, 4.0] },
  { url: "https://www.figma.com/api/mcp/asset/3c671273-a63d-4d40-b2a2-b18c20d64c1b", inset: [4.96, 2.72, 4.04, 4.33] },
  { url: "https://www.figma.com/api/mcp/asset/d7eda284-d07d-4302-9c32-62cb713416e7", inset: [5.34, 2.92, 4.35, 4.66] },
  { url: "https://www.figma.com/api/mcp/asset/2a6f81d0-d2c0-447e-987a-09bcffdbe818", inset: [5.71, 3.13, 4.65, 5.0] },
  { url: "https://www.figma.com/api/mcp/asset/cd716fb9-9b75-4a47-9b70-8907927cf000", inset: [6.09, 3.34, 4.95, 5.33] },
  { url: "https://www.figma.com/api/mcp/asset/ca976fb2-ceb6-4d76-a86d-108e88d19797", inset: [6.46, 3.54, 5.25, 5.66] },
  { url: "https://www.figma.com/api/mcp/asset/e96dd6dd-e578-43b3-a434-dfb66419d52a", inset: [6.84, 3.75, 5.55, 6.0] },
  { url: "https://www.figma.com/api/mcp/asset/95b2fa9a-700d-441c-9601-be6cd72215c8", inset: [7.21, 3.95, 5.85, 6.33] },
  { url: "https://www.figma.com/api/mcp/asset/4f43c0c8-a525-4c65-98cc-290483fb313e", inset: [7.59, 4.16, 6.15, 6.66] },
  { url: "https://www.figma.com/api/mcp/asset/e7b1d633-4b55-4074-9509-0cf21d00b57c", inset: [7.98, 4.36, 6.45, 6.99] },
  { url: "https://www.figma.com/api/mcp/asset/dbd486d0-2df5-4116-9737-8b2178769674", inset: [8.35, 4.56, 6.74, 7.32] },
  { url: "https://www.figma.com/api/mcp/asset/44672238-1dd4-424c-935c-0b98e08bafaa", inset: [8.73, 4.77, 7.03, 7.66] },
  { url: "https://www.figma.com/api/mcp/asset/06a726f4-f359-42ac-bc3a-88b58b30554d", inset: [9.1, 4.97, 7.33, 7.96] },
  { url: "https://www.figma.com/api/mcp/asset/6d89fbdf-e967-4a5b-bd22-7b21814ff889", inset: [9.48, 5.17, 7.62, 8.29] },
  { url: "https://www.figma.com/api/mcp/asset/198f5499-528c-416b-8d1b-74af1861048e", inset: [9.85, 5.37, 7.9, 8.63] },
  { url: "https://www.figma.com/api/mcp/asset/39d5c0a8-7752-4db0-9b87-cd17941ec435", inset: [10.22, 5.57, 8.19, 8.96] },
  { url: "https://www.figma.com/api/mcp/asset/8d54f456-94ef-4395-85ef-e230c39da0c7", inset: [10.6, 5.77, 8.48, 9.29] },
  { url: "https://www.figma.com/api/mcp/asset/ee81df32-eb6a-4d2d-9d8b-dcca7cded48c", inset: [10.97, 5.97, 8.76, 9.62] },
  { url: "https://www.figma.com/api/mcp/asset/8ce36dd6-ee0d-4b5d-b013-511e320325db", inset: [11.34, 6.17, 9.04, 9.95] },
  { url: "https://www.figma.com/api/mcp/asset/9a59ee93-50c7-4861-b895-c32ea8bc53a7", inset: [11.72, 6.37, 9.32, 10.28] },
  { url: "https://www.figma.com/api/mcp/asset/4bc92782-9618-4c10-9228-5afe61fc984f", inset: [12.09, 6.57, 9.6, 10.62] },
  { url: "https://www.figma.com/api/mcp/asset/e043e1c9-f351-4508-8d4a-38f84bfbfb3f", inset: [12.46, 6.77, 9.87, 10.95] },
  { url: "https://www.figma.com/api/mcp/asset/4a3e0e58-2230-4a4e-9634-6d8148d8fc74", inset: [12.83, 6.96, 10.15, 11.28] },
  { url: "https://www.figma.com/api/mcp/asset/5c4436f4-fe2b-46d8-84f1-dbdba8996144", inset: [13.21, 7.16, 10.42, 11.61] },
  { url: "https://www.figma.com/api/mcp/asset/6d7a5594-5fda-4122-81f2-1dabe7ea3d61", inset: [13.58, 7.35, 10.69, 11.94] },
  { url: "https://www.figma.com/api/mcp/asset/dfad0506-7776-4cb9-b806-5e5340b87ba9", inset: [13.95, 7.55, 10.95, 12.3] },
  { url: "https://www.figma.com/api/mcp/asset/d7431b6d-f6c7-4c0b-87b1-5624e5323288", inset: [14.32, 7.74, 11.22, 12.63] },
  { url: "https://www.figma.com/api/mcp/asset/2e10b014-afa8-49e1-9096-225531b23a17", inset: [14.69, 7.94, 11.48, 12.96] },
  { url: "https://www.figma.com/api/mcp/asset/1d91cc23-701b-4e16-b372-a8b85bbe726d", inset: [15.05, 8.13, 11.74, 13.29] },
  { url: "https://www.figma.com/api/mcp/asset/83953d49-9df2-456c-a540-f0bef488faae", inset: [15.42, 8.32, 12.0, 13.62] },
  { url: "https://www.figma.com/api/mcp/asset/30cce427-0245-4fcd-bbc0-14dac67bb54a", inset: [15.79, 8.51, 12.25, 13.95] },
  { url: "https://www.figma.com/api/mcp/asset/c4f0ebcd-07f3-4673-8256-357382dcb52e", inset: [16.16, 8.7, 12.5, 14.28] },
  { url: "https://www.figma.com/api/mcp/asset/363866b2-3872-4faa-b66f-ac1c6888f11c", inset: [16.52, 8.89, 12.75, 14.61] },
  { url: "https://www.figma.com/api/mcp/asset/4beadfbd-f5e6-4b85-ab1c-b52e50f607b5", inset: [16.89, 9.08, 13.0, 14.94] },
  { url: "https://www.figma.com/api/mcp/asset/0e94d042-3d02-4c6c-80a4-cd98473a49e3", inset: [17.25, 9.27, 13.24, 15.27] },
  { url: "https://www.figma.com/api/mcp/asset/5e180e84-e995-4a5a-b098-3ee3af0b946e", inset: [17.62, 9.46, 13.48, 15.6] },
  { url: "https://www.figma.com/api/mcp/asset/a34887c0-b4ae-464f-a1b1-0182ff03842c", inset: [17.98, 9.64, 13.71, 15.93] },
  { url: "https://www.figma.com/api/mcp/asset/601c3092-4e09-4fcd-88cb-a7059e472125", inset: [18.34, 9.83, 13.95, 16.26] },
  { url: "https://www.figma.com/api/mcp/asset/d4c609d9-7548-42c7-b13c-45d8c20dac25", inset: [18.69, 10.01, 14.17, 16.59] },
  { url: "https://www.figma.com/api/mcp/asset/424e72e8-9c58-4b76-b6fd-57a286fd294d", inset: [19.06, 10.19, 14.4, 16.92] },
  { url: "https://www.figma.com/api/mcp/asset/7a26ed7a-0d37-4f60-a7a1-0b8303318408", inset: [19.22, 10.3, 14.64, 17.14] },
  { url: "https://www.figma.com/api/mcp/asset/e510827f-b949-4fd4-933f-ee7a169ad45e", inset: [19.37, 10.4, 14.87, 17.35] },
  { url: "https://www.figma.com/api/mcp/asset/c81fc8c7-9e8f-4200-a20e-c2118f202cfc", inset: [19.53, 10.51, 15.11, 17.56] },
  { url: "https://www.figma.com/api/mcp/asset/72d26f93-fa58-46ae-9e18-4a15b07af806", inset: [19.69, 10.61, 15.35, 17.77] },
  { url: "https://www.figma.com/api/mcp/asset/dddca488-0726-44e6-83b0-a922e6c99cf6", inset: [19.84, 10.72, 15.59, 17.99] },
  { url: "https://www.figma.com/api/mcp/asset/1181cde3-9cd4-4fac-8d2b-8b2ed0482f35", inset: [20.0, 10.83, 15.82, 18.2] },
  { url: "https://www.figma.com/api/mcp/asset/aae5556d-9967-4349-a2c5-b67368b021ab", inset: [20.16, 10.93, 16.06, 18.41] },
  { url: "https://www.figma.com/api/mcp/asset/0df83176-d943-4f19-8f7d-aceb50c70b71", inset: [20.31, 11.04, 16.3, 18.62] },
  { url: "https://www.figma.com/api/mcp/asset/408cc0aa-a228-4e92-a665-4711ba53dd20", inset: [20.48, 11.14, 16.54, 18.84] },
  { url: "https://www.figma.com/api/mcp/asset/19465346-6437-4d33-a117-08e038a52e10", inset: [20.63, 11.25, 16.77, 19.05] },
  { url: "https://www.figma.com/api/mcp/asset/ba696584-7d15-4fff-9b0b-9b4df97b545c", inset: [20.79, 11.36, 17.01, 19.26] },
  { url: "https://www.figma.com/api/mcp/asset/5c928742-583e-4f49-af5b-23ba3838ac81", inset: [20.95, 11.46, 17.25, 19.49] },
  { url: "https://www.figma.com/api/mcp/asset/d7930a6a-97f1-40cc-9f5d-290719a51dc4", inset: [21.1, 11.57, 17.49, 19.7] },
  { url: "https://www.figma.com/api/mcp/asset/5b518e84-c2f3-42b7-8203-4db722bf8853", inset: [21.26, 11.67, 17.72, 19.91] },
  { url: "https://www.figma.com/api/mcp/asset/a120eaa8-300d-49bd-98c6-7b1b2e5c3abc", inset: [21.42, 11.78, 17.96, 20.12] },
  { url: "https://www.figma.com/api/mcp/asset/e3deee1d-5766-4f2a-9a90-c2013ff55694", inset: [21.57, 11.89, 18.2, 20.33] },
  { url: "https://www.figma.com/api/mcp/asset/272ee485-d66f-4b25-8f4f-dedacb5bc8d5", inset: [21.73, 11.99, 18.44, 20.54] },
  { url: "https://www.figma.com/api/mcp/asset/75ff4ed8-0802-4ad1-8723-12a8da5eed98", inset: [21.88, 12.1, 18.68, 20.75] },
  { url: "https://www.figma.com/api/mcp/asset/8c663a8f-e008-4a83-b6d7-a97173482e0b", inset: [22.04, 12.2, 18.91, 20.96] },
  { url: "https://www.figma.com/api/mcp/asset/16d4e4f6-96e5-43fb-a6bc-c85aaf4ed10e", inset: [22.19, 12.31, 19.15, 21.17] },
  { url: "https://www.figma.com/api/mcp/asset/dacbfa57-6acc-4150-9e69-c19bdd940577", inset: [22.35, 12.41, 19.39, 21.38] },
  { url: "https://www.figma.com/api/mcp/asset/c5cfcf14-088b-45fa-97be-b3574d579dbc", inset: [22.5, 12.52, 19.63, 21.59] },
  { url: "https://www.figma.com/api/mcp/asset/fa7320ba-c59d-4029-878c-70999b08f170", inset: [22.66, 12.63, 19.86, 21.8] },
  { url: "https://www.figma.com/api/mcp/asset/1f0d9c20-4c09-47c5-bc99-a1ab2421c420", inset: [22.81, 12.73, 20.1, 22.01] },
  { url: "https://www.figma.com/api/mcp/asset/ae197310-b5ee-4cd0-b404-1049947c27e1", inset: [22.97, 12.84, 20.34, 22.21] },
  { url: "https://www.figma.com/api/mcp/asset/caa92dc0-afc3-4732-b195-9612bdc7bb11", inset: [23.12, 12.95, 20.58, 22.42] },
  { url: "https://www.figma.com/api/mcp/asset/3f0abda1-5731-40c3-a21f-eb4c68c1fc4f", inset: [23.28, 13.05, 20.81, 22.63] },
  { url: "https://www.figma.com/api/mcp/asset/6f7a153e-eb08-4aa5-ab7d-c01240956463", inset: [23.43, 13.16, 21.05, 22.83] },
  { url: "https://www.figma.com/api/mcp/asset/3009b349-1a6c-486d-8a6a-88ce4fd844f7", inset: [23.58, 13.26, 21.29, 23.04] },
  { url: "https://www.figma.com/api/mcp/asset/bea09925-1424-4de0-be0d-e96c1cb731f8", inset: [23.74, 13.37, 21.53, 23.24] },
  { url: "https://www.figma.com/api/mcp/asset/da26a718-812b-4bdc-8a82-204481e8c86e", inset: [23.89, 13.48, 21.76, 23.45] },
  { url: "https://www.figma.com/api/mcp/asset/0e5f38c9-3cb9-4c71-8f3c-d4a34be5b95f", inset: [24.04, 13.58, 22.0, 23.65] },
  { url: "https://www.figma.com/api/mcp/asset/e3352ec9-5794-46c1-b8d6-e33a3f385f23", inset: [24.2, 13.69, 22.24, 23.85] },
  { url: "https://www.figma.com/api/mcp/asset/837c098c-059d-401d-81e3-a093619d7230", inset: [24.35, 13.79, 22.48, 24.06] },
  { url: "https://www.figma.com/api/mcp/asset/2ac3be6f-9672-4811-bb38-769fdd1fc152", inset: [24.5, 13.9, 22.71, 24.26] },
  { url: "https://www.figma.com/api/mcp/asset/96e87fb8-bc52-489c-85e8-c8c4e6b41c4d", inset: [24.66, 14.0, 22.95, 24.46] },
  { url: "https://www.figma.com/api/mcp/asset/29b584d1-9e51-472a-883c-51baa0c174b6", inset: [24.81, 14.11, 23.19, 24.66] },
  { url: "https://www.figma.com/api/mcp/asset/1299dc80-f9f6-42e2-967e-9bdf770f7e00", inset: [24.96, 14.22, 23.43, 24.86] },
  { url: "https://www.figma.com/api/mcp/asset/ee843c6e-bf68-4060-b7da-f92e921636d9", inset: [25.11, 14.32, 23.67, 25.07] },
  { url: "https://www.figma.com/api/mcp/asset/a4db3655-a354-4951-8e2a-63a3bacb9db3", inset: [25.27, 14.43, 23.9, 25.27] },
  { url: "https://www.figma.com/api/mcp/asset/f462bb2c-9597-42dc-811b-d1431e0d8ac4", inset: [25.42, 14.54, 24.14, 25.46] },
  { url: "https://www.figma.com/api/mcp/asset/c4598270-b2f6-4c33-974a-be11f043d0ff", inset: [25.57, 14.64, 24.38, 25.66] },
  { url: "https://www.figma.com/api/mcp/asset/5e947827-5e64-4e7b-83c8-72c3f874b494", inset: [25.72, 14.75, 24.62, 25.86] },
  { url: "https://www.figma.com/api/mcp/asset/96c47baa-d529-4e57-adf1-36688f530fc4", inset: [25.87, 14.85, 24.85, 26.06] },
  { url: "https://www.figma.com/api/mcp/asset/6a69155d-5b0b-4fa4-b7c2-ab0a9fbec725", inset: [26.02, 14.96, 25.09, 26.25] },
  { url: "https://www.figma.com/api/mcp/asset/7762af80-3c98-49dc-9bd1-501f860e1af8", inset: [26.18, 15.07, 25.33, 26.44] },
  { url: "https://www.figma.com/api/mcp/asset/2e876cfb-fc6c-46a3-9b6e-7d1b2330827f", inset: [26.33, 15.17, 25.57, 26.64] },
  { url: "https://www.figma.com/api/mcp/asset/0c281c87-74e0-4622-aa29-16727caf7710", inset: [26.48, 15.28, 25.8, 26.84] },
  { url: "https://www.figma.com/api/mcp/asset/33bc01a2-28bf-4d15-b379-3a05719517b7", inset: [26.63, 15.38, 26.04, 27.04] },
  { url: "https://www.figma.com/api/mcp/asset/0c249ec9-9798-44ed-a07e-d2fa219f2b35", inset: [26.78, 15.49, 26.28, 27.23] },
  { url: "https://www.figma.com/api/mcp/asset/1e2de7ff-49e1-40bb-967c-eecdbd1ea650", inset: [26.93, 15.59, 26.52, 27.43] },
  { url: "https://www.figma.com/api/mcp/asset/caacdd42-9668-4059-ac57-bb1d8f1b90fa", inset: [27.18, 15.72, 26.48, 27.58] },
  { url: "https://www.figma.com/api/mcp/asset/8d98ac5b-daab-4f40-bcd7-96d26dc1ec49", inset: [27.43, 15.84, 26.45, 27.74] },
  { url: "https://www.figma.com/api/mcp/asset/ff052fc1-b170-4113-aaf8-4f50c547775e", inset: [27.69, 15.97, 26.41, 27.9] },
  { url: "https://www.figma.com/api/mcp/asset/3525fb63-a0b8-4692-8e25-58e192943b9f", inset: [27.94, 16.09, 26.38, 28.06] },
  { url: "https://www.figma.com/api/mcp/asset/ad496e1c-a8e1-4f13-ac2a-d044e2660d74", inset: [28.19, 16.21, 26.34, 28.22] },
  { url: "https://www.figma.com/api/mcp/asset/91c5a626-6f84-4079-a1c0-44808ca16408", inset: [28.44, 16.34, 26.3, 28.38] },
  { url: "https://www.figma.com/api/mcp/asset/e7636887-6808-447d-bad1-fa163d486cd6", inset: [28.69, 16.46, 26.27, 28.54] },
  { url: "https://www.figma.com/api/mcp/asset/cfcbc682-c3fb-42b1-b94b-02ec49696bc5", inset: [28.95, 16.59, 26.23, 28.69] },
  { url: "https://www.figma.com/api/mcp/asset/b1fabaff-ba0c-435b-8918-2fdd6bef9d9a", inset: [29.2, 16.71, 26.2, 28.85] },
  { url: "https://www.figma.com/api/mcp/asset/b2477873-e56c-4cae-98f1-d274deffff1d", inset: [29.45, 16.83, 26.16, 29.01] },
  { url: "https://www.figma.com/api/mcp/asset/fdfc05bb-4c05-44ea-9a68-0d77c743e2fd", inset: [29.7, 16.96, 26.13, 29.16] },
  { url: "https://www.figma.com/api/mcp/asset/05b804d5-5a9d-404c-914d-ff9f67459320", inset: [29.96, 17.08, 26.09, 29.32] },
  { url: "https://www.figma.com/api/mcp/asset/15e8535e-ba82-440e-b81a-9125686c9a38", inset: [30.21, 17.2, 26.06, 29.48] },
  { url: "https://www.figma.com/api/mcp/asset/d92527db-fae0-47f5-813e-578a5a474336", inset: [30.46, 17.33, 26.02, 29.63] },
  { url: "https://www.figma.com/api/mcp/asset/2be13c02-47ff-43a1-9dff-2d05dc7bf566", inset: [30.71, 17.45, 25.99, 29.79] },
  { url: "https://www.figma.com/api/mcp/asset/d9fac1f4-518f-4b60-8124-6bf706cb6d0f", inset: [30.97, 17.58, 25.95, 29.94] },
  { url: "https://www.figma.com/api/mcp/asset/f6e22294-b195-46d2-8b42-3861b34510f4", inset: [31.22, 17.7, 25.92, 30.1] },
  { url: "https://www.figma.com/api/mcp/asset/30d43ed4-4ee3-4ca6-9151-29c8f08fba36", inset: [31.47, 17.82, 25.88, 30.25] },
  { url: "https://www.figma.com/api/mcp/asset/2d866c18-9ad5-4806-a720-b9abf74f0d13", inset: [31.72, 17.95, 25.85, 30.41] },
  { url: "https://www.figma.com/api/mcp/asset/98851137-6de7-432f-8f13-dee722f0a8f2", inset: [31.97, 18.07, 25.81, 30.56] },
  { url: "https://www.figma.com/api/mcp/asset/cec533ab-cf32-4c06-9c61-d6c99ce5b938", inset: [32.23, 18.19, 25.78, 30.72] },
  { url: "https://www.figma.com/api/mcp/asset/28961cea-55aa-4059-a1e3-9d8bc4ced97f", inset: [32.48, 18.32, 25.74, 30.87] },
  { url: "https://www.figma.com/api/mcp/asset/54cf93f3-5b61-4e0e-b3e4-ea13a7229d96", inset: [32.73, 18.44, 25.71, 31.03] },
  { url: "https://www.figma.com/api/mcp/asset/07996a3e-006c-410a-8a74-69994e113f41", inset: [32.98, 18.57, 25.67, 31.18] },
  { url: "https://www.figma.com/api/mcp/asset/0de8944b-a23f-4d6d-a533-7bbbbedf3848", inset: [33.24, 18.69, 25.63, 31.33] },
  { url: "https://www.figma.com/api/mcp/asset/320fe9d3-a779-482a-bb50-086885ad61ff", inset: [33.49, 18.81, 25.6, 31.48] },
  { url: "https://www.figma.com/api/mcp/asset/a639bacd-fcf5-4a5f-9ed5-90be092151d9", inset: [33.74, 18.94, 25.56, 31.64] },
  { url: "https://www.figma.com/api/mcp/asset/78a2fc8f-d035-4257-be1b-1aea9566076f", inset: [33.99, 19.06, 25.53, 31.79] },
  { url: "https://www.figma.com/api/mcp/asset/0bb459d6-b69f-4dcf-b3e7-df8c6d4bdb9b", inset: [34.25, 19.18, 25.49, 31.94] },
  { url: "https://www.figma.com/api/mcp/asset/b2ee951e-bbc7-4575-94ae-d73ae6517089", inset: [34.5, 19.31, 25.46, 32.09] },
  { url: "https://www.figma.com/api/mcp/asset/8c4f9c2b-9c61-427a-8627-797ac3e45ee1", inset: [34.75, 19.43, 25.42, 32.24] },
  { url: "https://www.figma.com/api/mcp/asset/85f16eed-9703-4bc2-85c2-02346af15de4", inset: [35.0, 19.56, 25.39, 32.39] },
  { url: "https://www.figma.com/api/mcp/asset/515807b6-75cb-4cfd-9047-def71be3e85a", inset: [35.26, 19.68, 25.35, 32.54] },
  { url: "https://www.figma.com/api/mcp/asset/d99a13dd-2cca-491e-a50b-3af45a488fa4", inset: [35.51, 19.8, 25.32, 32.69] },
  { url: "https://www.figma.com/api/mcp/asset/1823e58a-db25-49a8-aaf0-12709e2a3775", inset: [35.76, 19.93, 25.28, 32.84] },
  { url: "https://www.figma.com/api/mcp/asset/5a78a1fd-b1b3-446b-bc99-232ba1989c35", inset: [36.01, 20.05, 25.25, 32.99] },
  { url: "https://www.figma.com/api/mcp/asset/1d1af2bf-78bc-478d-b31e-a28359e3a0fc", inset: [36.27, 20.18, 25.21, 33.14] },
  { url: "https://www.figma.com/api/mcp/asset/be4671f7-a6a4-4d15-9b06-8f8e6bac959f", inset: [36.52, 20.3, 25.18, 33.28] },
  { url: "https://www.figma.com/api/mcp/asset/aab1c562-edbc-4031-9022-34f0de1cc392", inset: [36.77, 20.42, 25.14, 33.43] },
  { url: "https://www.figma.com/api/mcp/asset/8b4a621d-946c-4a3f-af4f-021f91424ca9", inset: [37.02, 20.55, 25.11, 33.58] },
  { url: "https://www.figma.com/api/mcp/asset/1dd112d3-7909-4872-84ef-611db91e93cd", inset: [37.27, 20.67, 25.07, 33.72] },
  { url: "https://www.figma.com/api/mcp/asset/2ad4d741-68a0-4e34-b296-ea75debcb0be", inset: [37.53, 20.79, 25.04, 33.87] },
  { url: "https://www.figma.com/api/mcp/asset/f0f2e644-c50b-4f7d-9533-aa701410b796", inset: [37.78, 20.92, 25.0, 34.01] },
  { url: "https://www.figma.com/api/mcp/asset/80fed3ab-a0eb-412d-9fb2-d4ffefe20996", inset: [38.03, 21.04, 24.96, 34.16] },
  { url: "https://www.figma.com/api/mcp/asset/c32f5526-0e73-410f-9a62-45acfcffe35c", inset: [38.28, 21.17, 24.93, 34.3] },
  { url: "https://www.figma.com/api/mcp/asset/f4f6907e-3205-4a3f-9893-a6ded1d72f5b", inset: [38.54, 21.29, 24.89, 34.44] },
  { url: "https://www.figma.com/api/mcp/asset/d4618378-1ead-42a5-8aef-3deaa4b78b17", inset: [38.79, 21.41, 24.86, 34.58] },
  { url: "https://www.figma.com/api/mcp/asset/180523c5-0e6c-4cb1-a5ff-968d7a601675", inset: [39.04, 21.54, 24.82, 34.72] },
  { url: "https://www.figma.com/api/mcp/asset/d3a9b0c4-a6f0-432e-82b1-b0ca38469940", inset: [39.29, 21.66, 24.79, 34.86] },
  { url: "https://www.figma.com/api/mcp/asset/a37a0316-9633-4d0d-b744-9ba4defb07a5", inset: [39.55, 21.79, 24.75, 35.0] },
  { url: "https://www.figma.com/api/mcp/asset/0739113e-7445-4512-b08e-ce63d38b1621", inset: [39.8, 21.91, 24.72, 35.14] },
];

// Container dimensions (percentage-based, use 1000x1000 as reference)
const W = 1000;
const H = 1000;

async function downloadSvg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url} → ${res.status}`);
  return res.text();
}

function parseSvg(svgText) {
  // Extract viewBox
  const vbMatch = svgText.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 100 100";

  // Extract path d and opacity
  const pathMatch = svgText.match(/<path[^>]*\bd="([^"]+)"[^>]*/);
  const d = pathMatch ? pathMatch[1] : "";
  const opacityMatch = svgText.match(/<path[^>]*\bopacity="([^"]+)"/);
  const opacity = opacityMatch ? opacityMatch[1] : "1";

  // Extract fill reference
  const fillMatch = svgText.match(/<path[^>]*\bfill="([^"]+)"/);
  const fill = fillMatch ? fillMatch[1] : "none";

  // Extract gradient defs
  const defsMatch = svgText.match(/<defs>([\s\S]*?)<\/defs>/);
  const defs = defsMatch ? defsMatch[1].trim() : "";

  return { viewBox, d, opacity, fill, defs };
}

async function main() {
  console.log(`Downloading ${ASSETS.length} SVG layers...`);

  // Download in batches of 20
  const batchSize = 20;
  const results = [];
  for (let i = 0; i < ASSETS.length; i += batchSize) {
    const batch = ASSETS.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (a, j) => {
        try {
          const svg = await downloadSvg(a.url);
          return { index: i + j, svg, inset: a.inset };
        } catch (e) {
          console.error(`  Failed layer ${i + j}: ${e.message}`);
          return null;
        }
      })
    );
    results.push(...batchResults.filter(Boolean));
    process.stdout.write(`  ${Math.min(i + batchSize, ASSETS.length)}/${ASSETS.length}\r`);
  }
  console.log(`\nDownloaded ${results.length} layers successfully.`);

  // Build combined SVG
  let allDefs = "";
  let allPaths = "";

  for (const { index, svg, inset } of results) {
    const parsed = parseSvg(svg);
    const [top, right, bottom, left] = inset;

    // Convert inset percentages to position/size within container
    const x = (left / 100) * W;
    const y = (top / 100) * H;
    const w = W * (1 - left / 100 - right / 100);
    const h = H * (1 - top / 100 - bottom / 100);

    // Unique gradient ID per layer
    const uniqueDefs = parsed.defs.replace(
      /id="([^"]+)"/g,
      (_, id) => `id="${id}_${index}"`
    );
    const uniqueFill = parsed.fill.replace(
      /url\(#([^)]+)\)/,
      (_, id) => `url(#${id}_${index})`
    );

    allDefs += uniqueDefs + "\n";

    allPaths += `  <svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${parsed.viewBox}" preserveAspectRatio="none">\n`;
    allPaths += `    <path d="${parsed.d}" fill="${uniqueFill}" opacity="${parsed.opacity}"/>\n`;
    allPaths += `  </svg>\n`;
  }

  const combined = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
${allDefs}
</defs>
${allPaths}
</svg>`;

  const { writeFileSync } = await import("fs");
  const outPath = "public/hero-v2/orb-contour.svg";
  writeFileSync(outPath, combined, "utf-8");
  console.log(`\nWritten: ${outPath} (${(combined.length / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
