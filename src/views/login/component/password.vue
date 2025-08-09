<template>
	<el-form size="large" class="login-content-form" ref="loginFormRef" :rules="loginRules" :model="state.ruleForm" @keyup.enter="onSignIn">
		<el-form-item class="login-animation1" prop="username">
			<el-input text :placeholder="$t('password.accountPlaceholder1')" v-model="state.ruleForm.username" clearable autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon">
						<ele-User />
					</el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="password">
			<el-input
				:type="state.isShowPassword ? 'text' : 'password'"
				:placeholder="$t('password.accountPlaceholder2')"
				v-model="state.ruleForm.password"
				autocomplete="off"
			>
				<template #prefix>
					<el-icon class="el-input__icon">
						<ele-Unlock />
					</el-icon>
				</template>
				<template #suffix>
					<i
						class="iconfont el-input__icon login-content-password"
						:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="state.isShowPassword = !state.isShowPassword"
					>
					</i>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="verifyCode" v-if="verifyEnable">
			<el-col :span="15">
				<el-input text maxlength="4" :placeholder="$t('mobile.placeholder2')" v-model="state.ruleForm.verifyCode" clearable autocomplete="off">
					<template #prefix>
						<el-icon class="el-input__icon">
							<ele-Position />
						</el-icon>
					</template>
				</el-input>
			</el-col>
			<el-col :span="1"></el-col>
			<el-col :span="8">
				<img :src="imgSrc" @click="getVerifyCode" />
			</el-col>
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button type="primary" class="login-content-submit" :loading="loading" @click="onSignIn">
				<span>{{ $t('password.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
		
	</el-form>
</template>

<script setup lang="ts" name="password">
import { reactive, ref, defineEmits } from 'vue';
import { useUserInfo } from '/@/stores/userInfo';
import { useI18n } from 'vue-i18n';
import { generateUUID } from '/@/utils/other';
import { rule } from '/@/utils/validate';

// 获取客户端 IP 地址
const getClientIP = () => {
	return new Promise((resolve) => {
		// 使用 WebRTC 获取本地 IP
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		});
		pc.createDataChannel('');
		pc.createOffer().then((offer) => pc.setLocalDescription(offer));
		pc.onicecandidate = (ice) => {
			if (ice && ice.candidate && ice.candidate.candidate) {
				const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
				const ipMatch = ice.candidate.candidate.match(ipRegex);
				if (ipMatch && ipMatch[0]) {
					pc.onicecandidate = null;
					pc.close();
					resolve(ipMatch[0]);
				}
			}
		};
		// 超时处理
		setTimeout(() => {
			pc.onicecandidate = null;
			pc.close();
			resolve('');
		}, 1000);
	});
};
// 使用国际化插件
const { t } = useI18n();

// 定义变量内容
const emit = defineEmits(['signInSuccess']); // 声明事件名称
const loginFormRef = ref(); // 定义LoginForm表单引用
const loading = ref(false); // 定义是否正在登录中
const state = reactive({
	isShowPassword: false, // 是否显示密码
	ruleForm: {
		// 表单数据
		username: '', // 用户名
		password: '', // 密码
		verifyCode: '', // 验证码
		captchaKey: '', // 验证码随机数
	},
});

const loginRules = reactive({
	username: [
		{ validator: rule.overLength, trigger: 'blur' },
		{ required: true, trigger: 'blur', message: t('password.accountPlaceholder1') },
	], // 用户名校验规则
	password: [
		{ validator: rule.overLength, trigger: 'blur' },
		{ required: true, trigger: 'blur', message: t('password.accountPlaceholder2') },
	], // 密码校验规则
	verifyCode: [
		{ validator: rule.overLength, trigger: 'blur' },
		{ required: true, trigger: 'blur', message: t('password.accountPlaceholder3') },
	], // 验证码校验规则
});

// 是否开启验证码
const verifyEnable = ref(import.meta.env.VITE_VERIFY_ENABLE === 'true');
const imgSrc = ref('');

//获取验证码图片
const getVerifyCode = () => {
	state.ruleForm.captchaKey = generateUUID();
	//imgSrc.value = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_IS_MICRO == 'false' ? '/admin' : '/auth'}/code/image?captchaKey=${state.ruleForm.captchaKey}`
	imgSrc.value = `${import.meta.env.VITE_API_URL}/captcha?captchaKey=${state.ruleForm.captchaKey}`;

	//`data:image/jpeg;base64,${this.arrayBufferToBase64(response.data.imageData)}`;
};

// 账号密码登录
const onSignIn = async () => {
	const valid = await loginFormRef.value.validate().catch(() => {}); // 表单校验
	if (!valid) return false;

	loading.value = true; // 正在登录中
	try {
		const ip = await getClientIP();
		await useUserInfo().login({ ...state.ruleForm, ip }); // 调用登录方法
		emit('signInSuccess'); // 触发事件
	} finally {
		getVerifyCode();
		loading.value = false; // 登录结束
	}
};

onMounted(() => {
	getVerifyCode();
});
</script>