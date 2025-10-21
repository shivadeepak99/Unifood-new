import { supabase } from './supabase'

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // NOTE: This function simulates sending an email for a demo.
    // In a production environment, you would integrate a real email service here.
    
    // 🎯 DEMO MODE: Use fixed OTP for easy testing
    const DEMO_MODE = true; // Set to false in production
    const demoOTP = DEMO_MODE ? '123456' : otp;
    
    const { error } = await supabase
      .from('otp_verifications')
      .insert({
        email,
        otp: demoOTP, // Use demo OTP if in demo mode
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        verified: false
      })

    if (error) {
      console.error('Error storing OTP:', error)
      return false
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, you would replace this with an API call to your email service (e.g., Resend, SendGrid)
    console.log(`✅ OTP ${demoOTP} sent to ${email} (${DEMO_MODE ? 'DEMO MODE' : 'simulated'})`) 
    console.log(`💡 Use OTP: ${demoOTP} for verification`)
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    // 🔍 Check if user is already verified
    const { data: userData } = await supabase
      .from('users')
      .select('is_verified')
      .eq('email', email)
      .single()
    
    if (userData?.is_verified) {
      // User already verified, return false to show appropriate message
      console.log('User already verified')
      return false
    }

    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return false
    }

    // Mark OTP as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', data.id)

    return true
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return false
  }
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}